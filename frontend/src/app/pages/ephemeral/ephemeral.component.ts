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
      <p>Crea o elimina una VM en GCP usando los job templates de AAP.</p>

      <div class="grid">
        <section class="card">
          <h3>Crear VM</h3>

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

            <button type="submit" [disabled]="loading" class="btn btn-create">
              {{ loading && action === 'create' ? 'Creando...' : 'Crear VM' }}
            </button>
          </form>
        </section>

        <section class="card">
          <h3>Eliminar VM</h3>

          <form (ngSubmit)="deleteVm()" class="form">
            <label>Nombre de instancia *
              <input [(ngModel)]="deleteInstanceName" name="delete_instance_name" placeholder="ej: demo-rhel-01" required />
            </label>

            <button type="submit" [disabled]="loading" class="btn btn-delete">
              {{ loading && action === 'delete' ? 'Eliminando...' : 'Eliminar VM' }}
            </button>
          </form>
        </section>
      </div>

      <div class="result success" *ngIf="result">
        Job lanzado en AAP ({{ action }}). <strong>job_id: {{ result.job_id }}</strong>
      </div>
      <div class="result status" *ngIf="jobStatus">
        Estado actual: <strong>{{ jobStatus.status }}</strong>
        <span *ngIf="jobStatus.elapsed !== undefined"> | Tiempo: {{ jobStatus.elapsed | number:'1.0-1' }}s</span>
      </div>
      <div class="result error" *ngIf="error">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 2rem; max-width: 1000px; }
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
    .btn {
      padding: .75rem 1rem; font-size: 1rem;
      color: #fff; border: none; border-radius: 4px;
      cursor: pointer; font-weight: 600; margin-top: .5rem;
    }
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
    .success { background: #d4edda; color: #155724; }
    .error   { background: #f8d7da; color: #721c24; }
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
      error: (err) => this.handleError(err, 'Error al crear VM efimera'),
    });
  }

  deleteVm() {
    this.prepareRequest('delete');

    this.jobs.ephemeralDelete({ instance_name: this.deleteInstanceName }).subscribe({
      next: (res) => this.handleSuccess(res),
      error: (err) => this.handleError(err, 'Error al eliminar VM efimera'),
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

  private formatErrorMessage(rawError: string | undefined, fallback: string): string {
    if (!rawError) return fallback;

    if (rawError.includes('already exists')) {
      return 'La VM no pudo crearse porque el nombre de instancia ya existe en GCP.';
    }

    if (rawError.includes('Faltan campos obligatorios')) {
      return 'Completa todos los campos obligatorios antes de enviar la solicitud.';
    }

    if (rawError.includes('Invalid value for field')) {
      return 'GCP rechazo uno de los parametros enviados. Revisa nombre, red, imagen o tamano de disco.';
    }

    if (rawError.includes('not found')) {
      return 'La VM indicada no existe o ya fue eliminada.';
    }

    return rawError
      .replace(/^AAP respondió \d+:\s*/i, '')
      .replace(/^AAP responded \d+:\s*/i, '')
      .trim() || fallback;
  }
}
