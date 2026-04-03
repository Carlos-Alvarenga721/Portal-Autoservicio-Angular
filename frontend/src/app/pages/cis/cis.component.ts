import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobsService, JobResponse } from '../../services/jobs.service';

@Component({
  selector: 'app-cis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <section class="card">
        <h2>Estandarizacion CIS</h2>
        <p>Ejecuta el workflow de cumplimiento CIS Level 1 sobre el servidor objetivo definido en AAP.</p>

        <div class="details">
          <div><strong>Operacion:</strong> Estandarizacion y remediacion del flujo CIS</div>
          <div><strong>Ejecucion:</strong> se dispara directamente desde el portal hacia AAP</div>
        </div>

        <button (click)="runAudit()" [disabled]="loading" class="btn">
          {{ loading ? 'Ejecutando...' : 'Ejecutar Tarea' }}
        </button>
      </section>

      <div class="result success" *ngIf="result">
        Workflow lanzado en AAP. <strong>job_id: {{ result.job_id }}</strong>
      </div>
      <div class="result error" *ngIf="error">
        {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 2rem; max-width: 760px; }
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
    .success { background: #d4edda; color: #155724; }
    .error   { background: #f8d7da; color: #721c24; }
  `]
})
export class CisComponent {
  loading = false;
  result: JobResponse | null = null;
  error = '';

  constructor(private jobs: JobsService) {}

  runAudit() {
    this.error = '';
    this.result = null;
    this.loading = true;

    this.jobs.cisAudit().subscribe({
      next: (res) => { this.result = res; this.loading = false; },
      error: (err) => {
        this.error = this.formatErrorMessage(err.error?.error, 'Error al lanzar auditoria');
        this.loading = false;
      },
    });
  }

  private formatErrorMessage(rawError: string | undefined, fallback: string): string {
    if (!rawError) return fallback;

    if (rawError.includes('Token no proporcionado') || rawError.includes('Token inválido')) {
      return 'La sesion no es valida. Vuelve a iniciar sesion en el portal.';
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
