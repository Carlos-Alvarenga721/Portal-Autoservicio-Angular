import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobsService, JobResponse, EmployeePayload } from '../../services/jobs.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <h2>👤 Alta de Empleado</h2>
      <p>Crea un empleado nuevo en Active Directory y Base de Datos corporativa.</p>

      <form (ngSubmit)="onCreate()" class="form">
        <label>Nombre *
          <input [(ngModel)]="form.firstName" name="firstName" required />
        </label>
        <label>Apellido *
          <input [(ngModel)]="form.lastName" name="lastName" required />
        </label>
        <label>Username *
          <input [(ngModel)]="form.username" name="username" required />
        </label>
        <label>Email *
          <input type="email" [(ngModel)]="form.email" name="email" required />
        </label>
        <label>Departamento
          <input [(ngModel)]="form.department" name="department" />
        </label>
        <label>Rol / Puesto
          <input [(ngModel)]="form.role" name="role" />
        </label>
        <label>Grupos AD (separados por coma)
          <input [(ngModel)]="form.adGroups" name="adGroups" />
        </label>

        <button type="submit" [disabled]="loading" class="btn">
          {{ loading ? 'Creando…' : 'Crear Empleado' }}
        </button>
      </form>

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
    .form { display: flex; flex-direction: column; gap: .75rem; margin-top: 1rem; }
    label { display: flex; flex-direction: column; font-weight: 600; color: #333; font-size: .9rem; }
    input {
      margin-top: .25rem; padding: .6rem; font-size: 1rem;
      border: 1px solid #ccc; border-radius: 4px;
    }
    .btn {
      padding: .75rem 2rem; font-size: 1rem; margin-top: .5rem;
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
export class EmployeesComponent {
  loading = false;
  result: JobResponse | null = null;
  error = '';

  form: EmployeePayload = {
    firstName: '', lastName: '', username: '',
    email: '', department: '', role: '', adGroups: ''
  };

  constructor(private jobs: JobsService) {}

  onCreate() {
    this.error = '';
    this.result = null;
    this.loading = true;

    this.jobs.employeeCreate(this.form).subscribe({
      next: (res) => { this.result = res; this.loading = false; },
      error: (err) => {
        this.error = err.error?.error || 'Error al crear empleado';
        this.loading = false;
      },
    });
  }
}
