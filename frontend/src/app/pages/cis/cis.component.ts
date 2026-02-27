import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobsService, JobResponse } from '../../services/jobs.service';

@Component({
  selector: 'app-cis',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h2>🛡️ Auditoría CIS</h2>
      <p>Dispara un workflow de auditoría de cumplimiento CIS en el entorno objetivo.</p>

      <button (click)="runAudit()" [disabled]="loading" class="btn">
        {{ loading ? 'Ejecutando…' : 'Ejecutar Auditoría' }}
      </button>

      <div class="result success" *ngIf="result">
        ✅ Job lanzado — <strong>job_id: {{ result.job_id }}</strong>
      </div>
      <div class="result error" *ngIf="error">
        ❌ {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 2rem; max-width: 600px; }
    h2 { color: #1a1a2e; }
    .btn {
      padding: .75rem 2rem; font-size: 1rem;
      background: #e74c3c; color: #fff; border: none;
      border-radius: 4px; cursor: pointer; font-weight: 600;
      margin-top: 1rem;
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
        this.error = err.error?.error || 'Error al lanzar auditoría';
        this.loading = false;
      },
    });
  }
}
