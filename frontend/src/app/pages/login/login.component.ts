import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <h1>AAP Portal</h1>
        <p>Ingresa tu correo corporativo para continuar</p>
        <form (ngSubmit)="onLogin()">
          <input
            type="email"
            [(ngModel)]="email"
            name="email"
            placeholder="usuario@empresa.com"
            required
            autocomplete="email"
          />
          <button type="submit" [disabled]="loading">
            {{ loading ? 'Autenticando…' : 'Entrar' }}
          </button>
        </form>
        <p class="error" *ngIf="error">{{ error }}</p>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex; justify-content: center; align-items: center;
      min-height: 100vh; background: #f0f2f5;
    }
    .login-card {
      background: #fff; padding: 2.5rem; border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0,0,0,.1); text-align: center;
      width: 100%; max-width: 400px;
    }
    .login-card h1 { margin: 0 0 .5rem; color: #1a1a2e; }
    .login-card p  { color: #666; margin-bottom: 1.5rem; }
    input {
      width: 100%; padding: .75rem; font-size: 1rem;
      border: 1px solid #ccc; border-radius: 4px;
      box-sizing: border-box; margin-bottom: 1rem;
    }
    button {
      width: 100%; padding: .75rem; font-size: 1rem;
      background: #e74c3c; color: #fff; border: none;
      border-radius: 4px; cursor: pointer; font-weight: 600;
    }
    button:disabled { opacity: .6; cursor: not-allowed; }
    button:hover:not(:disabled) { background: #c0392b; }
    .error { color: #e74c3c; margin-top: 1rem; }
  `]
})
export class LoginComponent {
  email = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.error = '';
    this.loading = true;

    this.auth.login(this.email).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Error al iniciar sesión';
      },
    });
  }
}
