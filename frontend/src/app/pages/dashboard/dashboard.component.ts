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
      <h2>Módulos de Automatización</h2>
      <div class="cards">
        <a routerLink="/cis" class="card">
          <div class="card-icon">🛡️</div>
          <h3>Seguridad CIS</h3>
          <p>Ejecutar auditoría de cumplimiento CIS</p>
        </a>

        <a routerLink="/employees" class="card">
          <div class="card-icon">👤</div>
          <h3>Gestión Empleados</h3>
          <p>Alta de empleados en AD y BD</p>
        </a>

        <a routerLink="/ephemeral" class="card">
          <div class="card-icon">☁️</div>
          <h3>Entornos Efímeros</h3>
          <p>Crear o eliminar entornos temporales</p>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 2rem; }
    h2 { color: #1a1a2e; margin-bottom: 1.5rem; }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
    }
    .card {
      display: block; background: #fff; padding: 2rem; border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,.08); text-decoration: none;
      color: inherit; transition: transform .15s, box-shadow .15s;
    }
    .card:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 16px rgba(0,0,0,.12);
    }
    .card-icon { font-size: 2.5rem; margin-bottom: .75rem; }
    .card h3 { margin: 0 0 .5rem; color: #1a1a2e; }
    .card p  { margin: 0; color: #666; font-size: .9rem; }
  `]
})
export class DashboardComponent {
  constructor(public auth: AuthService) {}
}
