import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AltaPayload,
  BajaPayload,
  CambioRolPayload,
  JobResponse,
  JobStatusResponse,
  JobsService,
  ResetPayload,
  toOracleUsername,
} from '../../services/jobs.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <h2>Gestion de Empleados</h2>
      <p>Dispara los workflows y job templates de AAP para alta, baja, cambio de rol y reseteo de contrasena.</p>

      <section class="card operation-card">
        <label class="selector">
          Operacion *
          <select [(ngModel)]="selectedOperation" name="selected_operation" class="selector-input">
            <option value="alta">Alta</option>
            <option value="baja">Baja</option>
            <option value="cambio-rol">Cambio de rol</option>
            <option value="reset">Reset de contraseña</option>
          </select>
        </label>
      </section>

      <div class="grid">
        <section class="card" *ngIf="selectedOperation === 'alta'">
          <h3>Alta</h3>
          <form (ngSubmit)="onAlta()" class="form">
            <div class="helper-banner">
              <div class="helper-text">
                <strong>Usuario Oracle</strong>
                <span>Generalo primero a partir del username AD y luego completa el resto del formulario.</span>
              </div>
              <button type="button" class="btn btn-secondary btn-inline" (click)="autofillOracleUsername()" [disabled]="loading">
                Generar usuario Oracle
              </button>
            </div>

            <label>Username AD *
              <input [(ngModel)]="alta.employee_username" name="alta_username" required />
            </label>
            <label>Nombre completo *
              <input [(ngModel)]="alta.employee_full_name" name="alta_full_name" required placeholder="Nombre Apellido" />
            </label>
            <label>Contraseña *
              <input [(ngModel)]="alta.employee_password" name="alta_password" type="password" required />
            </label>
            <label>Usuario Oracle *
              <input
                [(ngModel)]="alta.employee_oracle_username"
                name="alta_oracle_username"
                required
                placeholder="Se puede autogenerar"
              />
            </label>
            <label>Rol *
              <select [(ngModel)]="alta.employee_role" name="alta_role" required>
                <option value="APP_READONLY">APP_READONLY</option>
                <option value="APP_OPERATOR">APP_OPERATOR</option>
              </select>
            </label>

            <button type="submit" [disabled]="loading" class="btn btn-primary">
              {{ loading && action === 'alta' ? 'Ejecutando...' : 'Lanzar alta' }}
            </button>
          </form>
        </section>

        <section class="card" *ngIf="selectedOperation === 'baja'">
          <h3>Baja</h3>
          <form (ngSubmit)="onBaja()" class="form">
            <label>Username AD *
              <input [(ngModel)]="baja.employee_username" name="baja_username" required />
            </label>
            <label>Usuario Oracle *
              <input [(ngModel)]="baja.employee_oracle_username" name="baja_oracle_username" required />
            </label>

            <button type="submit" [disabled]="loading" class="btn">
              {{ loading && action === 'baja' ? 'Ejecutando...' : 'Lanzar baja' }}
            </button>
          </form>
        </section>

        <section class="card" *ngIf="selectedOperation === 'cambio-rol'">
          <h3>Cambio de rol</h3>
          <form (ngSubmit)="onCambioRol()" class="form">
            <label>Usuario Oracle *
              <input [(ngModel)]="cambioRol.employee_oracle_username" name="cambio_oracle_username" required />
            </label>
            <label>Rol anterior *
              <select [(ngModel)]="cambioRol.employee_role_anterior" name="cambio_role_anterior" required>
                <option value="APP_READONLY">APP_READONLY</option>
                <option value="APP_OPERATOR">APP_OPERATOR</option>
              </select>
            </label>
            <label>Nuevo rol *
              <select [(ngModel)]="cambioRol.employee_role" name="cambio_role" required>
                <option value="APP_READONLY">APP_READONLY</option>
                <option value="APP_OPERATOR">APP_OPERATOR</option>
              </select>
            </label>

            <button type="submit" [disabled]="loading" class="btn">
              {{ loading && action === 'cambio-rol' ? 'Ejecutando...' : 'Lanzar cambio de rol' }}
            </button>
          </form>
        </section>

        <section class="card" *ngIf="selectedOperation === 'reset'">
          <h3>Reset de contraseña AD</h3>
          <form (ngSubmit)="onReset()" class="form">
            <label>Username AD *
              <input [(ngModel)]="reset.employee_username" name="reset_username" required />
            </label>
            <label>Nueva contraseña *
              <input [(ngModel)]="reset.employee_password" name="reset_password" type="password" required />
            </label>

            <button type="submit" [disabled]="loading" class="btn">
              {{ loading && action === 'reset' ? 'Ejecutando...' : 'Lanzar reset' }}
            </button>
          </form>
        </section>
      </div>

      <div class="result success" *ngIf="result">
        Job lanzado en AAP. <strong>job_id: {{ result.job_id }}</strong>
      </div>
      <div class="result status" *ngIf="jobStatus" [class.status-pending]="jobStatus.status === 'pending'" [class.status-running]="jobStatus.status === 'running'" [class.status-successful]="jobStatus.status === 'successful'" [class.status-failed]="isFailedStatus(jobStatus.status)">
        Estado actual: <strong>{{ getStatusLabel(jobStatus.status) }}</strong>
        <span *ngIf="jobStatus.elapsed !== undefined"> | Tiempo: {{ jobStatus.elapsed | number:'1.0-1' }}s</span>
      </div>
      <div class="result error" *ngIf="error">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 2rem; max-width: 1100px; }
    h2 { color: #1a1a2e; margin-bottom: .5rem; }
    p { color: #555; margin-bottom: 1.5rem; }
    .operation-card { margin-bottom: 1.25rem; max-width: 540px; }
    .grid {
      display: grid;
      grid-template-columns: minmax(320px, 640px);
      gap: 1.25rem;
    }
    .card {
      background: #fff;
      border-radius: 10px;
      padding: 1.25rem;
      box-shadow: 0 2px 10px rgba(0,0,0,.08);
    }
    h3 { margin: 0 0 1rem; color: #1a1a2e; }
    .selector {
      display: flex;
      flex-direction: column;
      font-weight: 600;
      color: #333;
      font-size: .9rem;
    }
    .selector-input { max-width: 300px; }
    .form { display: flex; flex-direction: column; gap: .75rem; }
    label { display: flex; flex-direction: column; font-weight: 600; color: #333; font-size: .9rem; }
    input, select {
      margin-top: .25rem; padding: .6rem; font-size: 1rem;
      border: 1px solid #ccc; border-radius: 4px;
      background: #fff;
    }
    .helper-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: .9rem 1rem;
      border-radius: 8px;
      background: #eef4fb;
      color: #1f3954;
    }
    .helper-text strong,
    .helper-text span {
      display: block;
    }
    .helper-text span {
      margin-top: .2rem;
      font-size: .85rem;
      color: #48627c;
    }
    .btn {
      padding: .75rem 1rem; font-size: 1rem; margin-top: .5rem;
      background: #e74c3c; color: #fff; border: none;
      border-radius: 4px; cursor: pointer; font-weight: 600;
      width: fit-content;
    }
    .btn-primary { min-width: 170px; }
    .btn-secondary { background: #34495e; }
    .btn-secondary:hover:not(:disabled) { background: #243342; }
    .btn-inline { margin-top: 0; white-space: nowrap; }
    .btn:disabled { opacity: .6; cursor: not-allowed; }
    .btn:hover:not(:disabled) { background: #c0392b; }
    .result {
      margin-top: 1.5rem; padding: 1rem; border-radius: 4px;
      font-size: .95rem;
    }
    .status  { background: #e8f1fb; color: #184a7a; }
    .status-pending { background: #fff4d6; color: #8a6d1d; }
    .status-running { background: #e8f1fb; color: #184a7a; }
    .status-successful { background: #d4edda; color: #155724; }
    .status-failed { background: #f8d7da; color: #721c24; }
    .success { background: #d4edda; color: #155724; }
    .error   { background: #f8d7da; color: #721c24; }
    @media (max-width: 640px) {
      .helper-banner {
        flex-direction: column;
        align-items: flex-start;
      }
      .selector-input {
        max-width: 100%;
      }
    }
  `]
})
export class EmployeesComponent implements OnDestroy {
  loading = false;
  result: JobResponse | null = null;
  jobStatus: JobStatusResponse | null = null;
  error = '';
  selectedOperation: 'alta' | 'baja' | 'cambio-rol' | 'reset' = 'alta';
  action: 'alta' | 'baja' | 'cambio-rol' | 'reset' | null = null;
  private statusPollId: ReturnType<typeof setInterval> | null = null;

  alta: AltaPayload = {
    employee_username: '',
    employee_full_name: '',
    employee_password: '',
    employee_oracle_username: '',
    employee_role: 'APP_READONLY',
  };

  baja: BajaPayload = {
    employee_username: '',
    employee_oracle_username: '',
  };

  cambioRol: CambioRolPayload = {
    employee_oracle_username: '',
    employee_role_anterior: 'APP_READONLY',
    employee_role: 'APP_OPERATOR',
  };

  reset: ResetPayload = {
    employee_username: '',
    employee_password: '',
  };

  constructor(private jobs: JobsService) {}

  ngOnDestroy() {
    this.stopPolling();
  }

  autofillOracleUsername() {
    if (!this.alta.employee_username.trim()) {
      this.error = 'Primero escribe el username AD para generar el usuario Oracle.';
      return;
    }

    this.alta.employee_oracle_username = toOracleUsername(this.alta.employee_username.trim());
    this.error = '';
  }

  onAlta() {
    this.prepareRequest('alta');
    if (!this.alta.employee_oracle_username.trim()) {
      this.alta.employee_oracle_username = toOracleUsername(this.alta.employee_username.trim());
    }

    this.jobs.employeeAlta(this.alta).subscribe({
      next: (res) => this.handleSuccess(res),
      error: (err) => this.handleError(err, 'Error al lanzar alta de empleado'),
    });
  }

  onBaja() {
    this.prepareRequest('baja');

    this.jobs.employeeBaja(this.baja).subscribe({
      next: (res) => this.handleSuccess(res),
      error: (err) => this.handleError(err, 'Error al lanzar baja de empleado'),
    });
  }

  onCambioRol() {
    this.prepareRequest('cambio-rol');

    this.jobs.employeeCambioRol(this.cambioRol).subscribe({
      next: (res) => this.handleSuccess(res),
      error: (err) => this.handleError(err, 'Error al lanzar cambio de rol'),
    });
  }

  onReset() {
    this.prepareRequest('reset');

    this.jobs.employeeReset(this.reset).subscribe({
      next: (res) => this.handleSuccess(res),
      error: (err) => this.handleError(err, 'Error al lanzar reset de contrasena'),
    });
  }

  private prepareRequest(action: 'alta' | 'baja' | 'cambio-rol' | 'reset') {
    this.action = action;
    this.error = '';
    this.result = null;
    this.jobStatus = null;
    this.loading = true;
    this.stopPolling();
  }

  private handleSuccess(res: JobResponse) {
    this.result = res;
    this.loading = false;
    this.startPolling(res.job_id);
  }

  private handleError(err: any, fallback: string) {
    this.error = err.error?.error || fallback;
    this.loading = false;
  }

  private startPolling(jobId: number) {
    this.fetchJobStatus(jobId);
    this.statusPollId = setInterval(() => this.fetchJobStatus(jobId), 5000);
  }

  private fetchJobStatus(jobId: number) {
    this.jobs.getJobStatus(jobId).subscribe({
      next: (status) => {
        this.jobStatus = status;
        if (['successful', 'failed', 'error', 'canceled'].includes(status.status)) {
          this.stopPolling();
        }
      },
      error: () => this.stopPolling(),
    });
  }

  private stopPolling() {
    if (this.statusPollId) {
      clearInterval(this.statusPollId);
      this.statusPollId = null;
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'En cola';
      case 'waiting': return 'Esperando';
      case 'running': return 'Ejecutando';
      case 'successful': return 'Completado';
      case 'failed': return 'Fallido';
      case 'error': return 'Error';
      case 'canceled': return 'Cancelado';
      default: return status;
    }
  }

  isFailedStatus(status: string): boolean {
    return ['failed', 'error', 'canceled'].includes(status);
  }
}
