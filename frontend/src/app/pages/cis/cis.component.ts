import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobsService, JobResponse, JobStatusResponse } from '../../services/jobs.service';

@Component({
  selector: 'app-cis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <section class="card">
        <h2>Estandarización CIS</h2>
        <p>Ejecuta la revisión de cumplimiento CIS Level 1 sobre el servidor objetivo definido en AAP.</p>

        <div class="details">
          <div><strong>Operación:</strong> estandarización y remediación del flujo CIS</div>
          <div><strong>Ejecución:</strong> se lanza directamente desde este portal hacia AAP</div>
        </div>

        <button (click)="runAudit()" [disabled]="loading" class="btn">
          {{ loading ? 'Ejecutando...' : 'Ejecutar revisión CIS' }}
        </button>
      </section>

      <div class="result success" *ngIf="result">
        Workflow lanzado exitosamente.
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
    .card {
      background: #fff;
      border-radius: 10px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,.08);
    }
    h2 { color: #1a1a2e; margin: 0 0 .5rem; }
    p { color: #555; margin: 0 0 1rem; }
    .details {
      display: grid;
      gap: .5rem;
      margin-bottom: 1rem;
      color: #333;
      font-size: .95rem;
    }
    .btn {
      padding: .75rem 1.25rem; font-size: 1rem;
      background: #e74c3c; color: #fff; border: none;
      border-radius: 4px; cursor: pointer; font-weight: 600;
    }
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
  `]
})
export class CisComponent implements OnDestroy {
  loading = false;
  result: JobResponse | null = null;
  jobStatus: JobStatusResponse | null = null;
  error = '';
  private statusPollId: ReturnType<typeof setInterval> | null = null;

  constructor(private jobs: JobsService) {}

  ngOnDestroy() {
    this.stopPolling();
  }

  runAudit() {
    this.error = '';
    this.result = null;
    this.jobStatus = null;
    this.loading = true;
    this.stopPolling();

    this.jobs.cisAudit().subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
        this.startPolling(res.job_id);
      },
      error: (err) => {
        this.error = this.formatErrorMessage(err.error?.error, 'Error al lanzar la revisión CIS');
        this.loading = false;
      },
    });
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

    if (rawError.includes('Token no proporcionado') || rawError.includes('Token inválido')) {
      return 'La sesión no es válida. Vuelve a iniciar sesión en el portal.';
    }

    if (rawError.includes('AAP respondió') || rawError.includes('AAP responded')) {
      return rawError
        .replace(/^AAP respondió \d+:\s*/i, '')
        .replace(/^AAP responded \d+:\s*/i, '')
        .trim() || fallback;
    }

    return rawError;
  }
}
