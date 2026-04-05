import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar" *ngIf="auth.isLoggedIn">
      <div class="brand">
        <a routerLink="/dashboard" class="logo">AAP Portal</a>
      </div>
      <div class="links">
        <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Dashboard</a>
        <a *ngIf="auth.hasAccess('cis')" routerLink="/cis" routerLinkActive="active">CIS</a>
        <a *ngIf="auth.hasAccess('employees')" routerLink="/employees" routerLinkActive="active">Empleados</a>
        <a *ngIf="auth.hasAccess('ephemeral')" routerLink="/ephemeral" routerLinkActive="active">Entornos Temporales</a>
      </div>
      <div class="user-info" *ngIf="auth.user as u">
        <span class="badge" [class.operador]="u.role === 'operador'">{{ u.role }}</span>
        <span class="email">{{ u.email }}</span>
        <button class="logout-btn" (click)="auth.logout()">Salir</button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex; align-items: center; justify-content: space-between;
      background: #1a1a2e; color: #fff; padding: .6rem 1.5rem;
      font-size: .9rem;
    }
    .logo {
      font-weight: 700; font-size: 1.1rem; color: #fff;
      text-decoration: none;
    }
    .links { display: flex; gap: 1rem; }
    .links a {
      color: rgba(255,255,255,.7); text-decoration: none;
      padding: .3rem .6rem; border-radius: 4px; transition: .15s;
    }
    .links a:hover, .links a.active {
      color: #fff; background: rgba(255,255,255,.12);
    }
    .user-info { display: flex; align-items: center; gap: .75rem; }
    .badge {
      background: #3498db; color: #fff; padding: .15rem .5rem;
      border-radius: 3px; font-size: .75rem; text-transform: uppercase;
      font-weight: 700;
    }
    .badge.operador { background: #e67e22; }
    .email { color: rgba(255,255,255,.75); }
    .logout-btn {
      background: transparent; border: 1px solid rgba(255,255,255,.3);
      color: #fff; padding: .3rem .7rem; border-radius: 4px;
      cursor: pointer; font-size: .8rem;
    }
    .logout-btn:hover { background: rgba(255,255,255,.1); }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
}
