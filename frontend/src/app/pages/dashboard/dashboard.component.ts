import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard">
      <section class="hero">
        <div>
          <span class="eyebrow">Portal Self-Service</span>
          <h2>Módulos de Automatización</h2>
          <p class="intro">Accede desde un solo panel a los procesos de seguridad, gestión de empleados y entornos temporales conectados con AAP.</p>
        </div>
        <div class="summary" *ngIf="auth.user as u">
          <span class="summary-label">Sesión activa</span>
          <strong>{{ u.email }}</strong>
          <span class="summary-role">{{ u.role }}</span>
        </div>
      </section>

      <div class="cards">
        <a *ngIf="auth.hasAccess('cis')" routerLink="/cis" class="card">
          <div class="card-icon">🛡️</div>
          <h3>Seguridad CIS</h3>
          <p>Ejecuta la revisión de cumplimiento CIS y consulta el estado del workflow en tiempo real.</p>
        </a>

        <a *ngIf="auth.hasAccess('employees')" routerLink="/employees" class="card">
          <div class="card-icon">👤</div>
          <h3>Gestión de Empleados</h3>
          <p>Lanza altas, bajas, cambios de rol y reseteo de contraseña desde formularios guiados.</p>
        </a>

        <a *ngIf="auth.hasAccess('ephemeral')" routerLink="/ephemeral" class="card">
          <div class="card-icon">☁️</div>
          <h3>Entornos Temporales</h3>
          <p>Crea o elimina entornos temporales bajo demanda en GCP con seguimiento de estado.</p>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 2rem; }
    .hero {
      display: flex;
      justify-content: space-between;
      gap: 1.5rem;
      align-items: flex-start;
      margin-bottom: 1.75rem;
    }
    .eyebrow {
      display: inline-block;
      padding: .25rem .6rem;
      border-radius: 999px;
      background: #e8f1fb;
      color: #184a7a;
      font-size: .75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .04em;
      margin-bottom: .75rem;
    }
    h2 { color: #1a1a2e; margin: 0 0 .5rem; }
    .intro {
      margin: 0;
      max-width: 640px;
      color: #56606d;
      font-size: .98rem;
      line-height: 1.5;
    }
    .summary {
      min-width: 240px;
      padding: 1rem 1.1rem;
      border-radius: 10px;
      background: #ffffff;
      box-shadow: 0 2px 10px rgba(0,0,0,.08);
      color: #1a1a2e;
    }
    .summary-label {
      display: block;
      font-size: .78rem;
      text-transform: uppercase;
      letter-spacing: .04em;
      color: #6b7280;
      margin-bottom: .35rem;
    }
    .summary strong {
      display: block;
      font-size: .98rem;
      margin-bottom: .45rem;
      word-break: break-word;
    }
    .summary-role {
      display: inline-block;
      padding: .25rem .55rem;
      border-radius: 999px;
      background: #fff4d6;
      color: #8a6d1d;
      font-size: .78rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
    }
    .card {
      display: block; background: #fff; padding: 2rem; border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,.08); text-decoration: none;
      color: inherit; transition: transform .15s, box-shadow .15s, border-color .15s;
      border: 1px solid transparent;
    }
    .card:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 16px rgba(0,0,0,.12);
      border-color: #d9e3f0;
    }
    .card-icon { font-size: 2.5rem; margin-bottom: .75rem; }
    .card h3 { margin: 0 0 .5rem; color: #1a1a2e; }
    .card p  { margin: 0; color: #666; font-size: .92rem; line-height: 1.45; }
    @media (max-width: 760px) {
      .hero {
        flex-direction: column;
      }
      .summary {
        width: 100%;
      }
    }
  `]
})
export class DashboardComponent {
  constructor(public auth: AuthService) {}
}
