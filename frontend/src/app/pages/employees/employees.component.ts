import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AltaPayload,
  BajaPayload,
  CambioRolPayload,
  JobResponse,
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

      <div class="grid">
        <section class="card">
          <h3>Alta</h3>
          <form (ngSubmit)="onAlta()" class="form">
            <label>Username AD *
              <input [(ngModel)]="alta.employee_username" name="alta_username" required />
            </label>
            <label>Nombre completo *
              <input [(ngModel)]="alta.employee_full_name" name="alta_full_name" required placeholder="Nombre Apellido" />
            </label>
            <label>Contrasena *
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

            <div class="inline-actions">
              <button type="button" class="btn btn-secondary" (click)="autofillOracleUsername()" [disabled]="loading">
                Generar usuario Oracle
              </button>
              <button type="submit" [disabled]="loading" class="btn">
                {{ loading && action === 'alta' ? 'Ejecutando...' : 'Lanzar alta' }}
              </button>
            </div>
          </form>
        </section>

        <section class="card">
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

        <section class="card">
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

        <section class="card">
          <h3>Reset de contrasena AD</h3>
          <form (ngSubmit)="onReset()" class="form">
            <label>Username AD *
              <input [(ngModel)]="reset.employee_username" name="reset_username" required />
            </label>
            <label>Nueva contrasena *
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
      <div class="result error" *ngIf="error">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 2rem; max-width: 1100px; }
    h2 { color: #1a1a2e; margin-bottom: .5rem; }
    p { color: #555; margin-bottom: 1.5rem; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.25rem;
    }
    .card {
      background: #fff;
      border-radius: 10px;
      padding: 1.25rem;
      box-shadow: 0 2px 10px rgba(0,0,0,.08);
    }
    h3 { margin: 0 0 1rem; color: #1a1a2e; }
    .form { display: flex; flex-direction: column; gap: .75rem; }
    label { display: flex; flex-direction: column; font-weight: 600; color: #333; font-size: .9rem; }
    input, select {
      margin-top: .25rem; padding: .6rem; font-size: 1rem;
      border: 1px solid #ccc; border-radius: 4px;
      background: #fff;
    }
    .inline-actions {
      display: flex;
      gap: .75rem;
      flex-wrap: wrap;
      margin-top: .25rem;
    }
    .btn {
      padding: .75rem 1rem; font-size: 1rem; margin-top: .5rem;
      background: #e74c3c; color: #fff; border: none;
      border-radius: 4px; cursor: pointer; font-weight: 600;
    }
    .btn-secondary { background: #34495e; }
    .btn-secondary:hover:not(:disabled) { background: #243342; }
    .btn:disabled { opacity: .6; cursor: not-allowed; }
    .btn:hover:not(:disabled) { background: #c0392b; }
    .result {
      margin-top: 1.5rem; padding: 1rem; border-radius: 4px;
      font-size: .95rem;
    }
    .success { background: #d4edda; color: #155724; }
    .error   { background: #f8d7da; color: #721c24; }
  `]
})
export class EmployeesComponent {
  loading = false;
  result: JobResponse | null = null;
  error = '';
  action: 'alta' | 'baja' | 'cambio-rol' | 'reset' | null = null;

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
    this.loading = true;
  }

  private handleSuccess(res: JobResponse) {
    this.result = res;
    this.loading = false;
  }

  private handleError(err: any, fallback: string) {
    this.error = err.error?.error || fallback;
    this.loading = false;
  }
}
