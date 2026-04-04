import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  EphemeralCreatePayload,
  JobResponse,
  JobStatusResponse,
  JobsService,
} from '../../services/jobs.service';

@Component({
  selector: 'app-ephemeral',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <h2>Entornos Bajo Demanda</h2>
      <p>Crea o elimina Entornos Temporales en GCP usando los job templates de AAP.</p>

      <div class="grid">
        <section class="card card-create">
          <h3>Crear Entorno Temporal</h3>
          <p class="card-copy">Provisiona un Entorno Temporal en GCP con los parámetros mínimos necesarios para la demo.</p>

          <form (ngSubmit)="createVm()" class="form">
            <label>Nombre de instancia *
              <input [(ngModel)]="createForm.instance_name" name="instance_name" placeholder="ej: demo-rhel-01" required />
            </label>

            <label>Familia *
              <select [(ngModel)]="createForm.machine_family" name="machine_family" required>
                <option value="e2">E2</option>
                <option value="n2">N2</option>
              </select>
            </label>

            <label>Imagen *
              <select [(ngModel)]="createForm.image_version" name="image_version" required>
                <option value="rhel-9">RHEL 9</option>
                <option value="rhel-8">RHEL 8</option>
              </select>
            </label>

            <label>Disco (GB) *
              <input [(ngModel)]="createForm.disk_size_gb" name="disk_size_gb" type="number" min="20" required />
            </label>

            <label>TTL (horas) *
              <input [(ngModel)]="createForm.ttl_hours" name="ttl_hours" type="number" min="1" required />
            </label>

            <button type="submit" [disabled]="loading" class="btn btn-create btn-primary">
              {{ loading && action === 'create' ? 'Creando...' : 'Crear Entorno Temporal' }}
            </button>
          </form>
        </section>

        <section class="card card-delete">
          <h3>Eliminar Entorno Temporal</h3>
          <p class="card-copy">Usa esta acción solo cuando ya no necesites el entorno. La eliminación impacta directamente en GCP.</p>

          <div class="delete-warning">
            <strong>Acción destructiva</strong>
            <span>Verifica el nombre exacto de la instancia antes de continuar.</span>
          </div>

          <form (ngSubmit)="deleteVm()" class="form">
            <label>Nombre de instancia *
              <input [(ngModel)]="deleteInstanceName" name="delete_instance_name" placeholder="ej: demo-rhel-01" required />
            </label>

            <button type="submit" [disabled]="loading" class="btn btn-delete btn-primary">
              {{ loading && action === 'delete' ? 'Eliminando...' : 'Eliminar Entorno Temporal' }}
            </button>
          </form>
        </section>
      </div>

      <div class="result success" *ngIf="result">
        Job lanzado en AAP ({{ action }}). <strong>job_id: {{ result.job_id }}</strong>
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
    .page { padding: 2rem; max-width: 960px; }
    h2 { color: #1a1a2e; margin-bottom: .5rem; }
    p { color: #555; margin-bottom: 1.5rem; }
    .grid {
      display: grid;
      grid-template-columns: minmax(340px, 1.2fr) minmax(280px, .8fr);
      gap: 1.25rem;
      align-items: start;
    }
    .card {
      background: #fff;
      border-radius: 10px;
      padding: 1.25rem;
      box-shadow: 0 2px 10px rgba(0,0,0,.08);
    }
    .card-create { border-top: 4px solid #27ae60; }
    .card-delete { border-top: 4px solid #e74c3c; }
    h3 { margin: 0 0 1rem; color: #1a1a2e; }
    .card-copy {
      margin: 0 0 1rem;
      color: #5a6573;
      font-size: .92rem;
    }
    .form { display: flex; flex-direction: column; gap: .75rem; }
    label { display: flex; flex-direction: column; font-weight: 600; color: #333; font-size: .9rem; }
    input, select {
      margin-top: .25rem; padding: .6rem; font-size: 1rem;
      border: 1px solid #ccc; border-radius: 4px;
      background: #fff;
    }
    .delete-warning {
      display: flex;
      flex-direction: column;
      gap: .2rem;
      margin-bottom: 1rem;
      padding: .9rem 1rem;
      border-radius: 8px;
      background: #fff0ee;
      color: #7a2b21;
    }
    .delete-warning span {
      font-size: .85rem;
      color: #944236;
    }
    .btn {
      padding: .75rem 1rem; font-size: 1rem;
      color: #fff; border: none; border-radius: 4px;
      cursor: pointer; font-weight: 600; margin-top: .5rem;
      width: fit-content;
    }
    .btn-primary { min-width: 170px; }
    .btn:disabled { opacity: .6; cursor: not-allowed; }
    .btn-create { background: #27ae60; }
    .btn-create:hover:not(:disabled) { background: #219a52; }
    .btn-delete { background: #e74c3c; }
    .btn-delete:hover:not(:disabled) { background: #c0392b; }
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
    @media (max-width: 860px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EphemeralComponent implements OnDestroy {
  createForm: EphemeralCreatePayload = {
    instance_name: '',
    machine_family: 'e2',
    image_version: 'rhel-9',
    disk_size_gb: 30,
    ttl_hours: 4,
  };

  deleteInstanceName = '';
  action: 'create' | 'delete' = 'create';
  loading = false;
  result: JobResponse | null = null;
  jobStatus: JobStatusResponse | null = null;
  error = '';
  private statusPollId: ReturnType<typeof setInterval> | null = null;

  constructor(private jobs: JobsService) {}

  ngOnDestroy() {
    this.stopPolling();
  }

  createVm() {
    this.prepareRequest('create');

    this.jobs.ephemeralCreate(this.createForm).subscribe({
      next: (res) => this.handleSuccess(res),
      error: (err) => this.handleError(err, 'Error al crear el entorno temporal'),
    });
  }

  deleteVm() {
    this.prepareRequest('delete');

    this.jobs.ephemeralDelete({ instance_name: this.deleteInstanceName }).subscribe({
      next: (res) => this.handleSuccess(res),
      error: (err) => this.handleError(err, 'Error al eliminar el entorno temporal'),
    });
  }

  private prepareRequest(action: 'create' | 'delete') {
    this.error = '';
    this.result = null;
    this.jobStatus = null;
    this.action = action;
    this.loading = true;
    this.stopPolling();
  }

  private handleSuccess(res: JobResponse) {
    this.result = res;
    this.loading = false;
    this.startPolling(res.job_id);
  }

  private handleError(err: any, fallback: string) {
    this.error = this.formatErrorMessage(err.error?.error, fallback);
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

  private formatErrorMessage(rawError: string | undefined, fallback: string): string {
    if (!rawError) return fallback;

    if (rawError.includes('already exists')) {
      return 'No fue posible crear el entorno temporal porque ese nombre de instancia ya existe en GCP.';
    }

    if (rawError.includes('Faltan campos obligatorios')) {
      return 'Completa todos los campos obligatorios antes de enviar la solicitud.';
    }

    if (rawError.includes('Invalid value for field')) {
      return 'GCP rechazó uno de los parámetros enviados. Revisa el nombre, la red, la imagen o el tamaño del disco.';
    }

    if (rawError.includes('not found')) {
      return 'El entorno temporal indicado no existe o ya fue eliminado.';
    }

    return rawError
      .replace(/^AAP respondió \d+:\s*/i, '')
      .replace(/^AAP responded \d+:\s*/i, '')
      .trim() || fallback;
  }
}
