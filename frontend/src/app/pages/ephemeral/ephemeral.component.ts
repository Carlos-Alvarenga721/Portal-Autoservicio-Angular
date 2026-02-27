import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobsService, JobResponse } from '../../services/jobs.service';

@Component({
  selector: 'app-ephemeral',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <h2>☁️ Entornos Efímeros</h2>
      <p>Crea o elimina entornos temporales. TTL fijo: 3 horas.</p>

      <div class="form">
        <label>ID del Entorno *
          <input [(ngModel)]="envId" name="envId" placeholder="ej: sandbox-42" />
        </label>

        <div class="actions">
          <button (click)="launch('create')" [disabled]="loading || !envId" class="btn btn-create">
            {{ loading && action === 'create' ? 'Creando…' : 'Crear Entorno' }}
          </button>
          <button (click)="launch('delete')" [disabled]="loading || !envId" class="btn btn-delete">
            {{ loading && action === 'delete' ? 'Eliminando…' : 'Eliminar Entorno' }}
          </button>
        </div>
      </div>

      <div class="result success" *ngIf="result">
        ✅ Job lanzado ({{ action }}) — <strong>job_id: {{ result.job_id }}</strong>
      </div>
      <div class="result error" *ngIf="error">
        ❌ {{ error }}
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 2rem; max-width: 600px; }
    h2 { color: #1a1a2e; }
    .form { margin-top: 1rem; }
    label { display: flex; flex-direction: column; font-weight: 600; color: #333; font-size: .9rem; }
    input {
      margin-top: .25rem; padding: .6rem; font-size: 1rem;
      border: 1px solid #ccc; border-radius: 4px;
    }
    .actions { display: flex; gap: 1rem; margin-top: 1rem; }
    .btn {
      padding: .75rem 1.5rem; font-size: 1rem;
      color: #fff; border: none; border-radius: 4px;
      cursor: pointer; font-weight: 600;
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
    .success { background: #d4edda; color: #155724; }
    .error   { background: #f8d7da; color: #721c24; }
  `]
})
export class EphemeralComponent {
  envId = '';
  action: 'create' | 'delete' = 'create';
  loading = false;
  result: JobResponse | null = null;
  error = '';

  constructor(private jobs: JobsService) {}

  launch(action: 'create' | 'delete') {
    this.action = action;
    this.error = '';
    this.result = null;
    this.loading = true;

    const obs = action === 'create'
      ? this.jobs.ephemeralCreate(this.envId)
      : this.jobs.ephemeralDelete(this.envId);

    obs.subscribe({
      next: (res) => { this.result = res; this.loading = false; },
      error: (err) => {
        this.error = err.error?.error || `Error al ${action === 'create' ? 'crear' : 'eliminar'} entorno`;
        this.loading = false;
      },
    });
  }
}
