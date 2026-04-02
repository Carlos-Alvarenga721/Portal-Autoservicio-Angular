import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        <div class="logo">⚙️</div>
        <h1>AAP Portal</h1>
        <p>Portal de Automatización — Datum</p>

        <button class="btn-google" (click)="loginWithGoogle()">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
          Continuar con Google
        </button>

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
    .logo { font-size: 3rem; margin-bottom: 1rem; }
    .login-card h1 { margin: 0 0 .5rem; color: #1a1a2e; }
    .login-card p  { color: #666; margin-bottom: 1.5rem; }
    .btn-google {
      display: flex; align-items: center; justify-content: center;
      gap: .75rem; width: 100%; padding: .75rem;
      font-size: 1rem; font-weight: 600;
      background: #fff; color: #333;
      border: 1px solid #ddd; border-radius: 4px;
      cursor: pointer; transition: background .2s;
    }
    .btn-google:hover { background: #f7f7f7; }
    .btn-google img { width: 20px; height: 20px; }
    .error { color: #e74c3c; margin-top: 1rem; }
  `]
})
export class LoginComponent implements OnInit {
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Si viene con ?error= en la URL, mostrar mensaje
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'acceso_denegado') {
      this.error = 'Tu correo no está autorizado para acceder al portal.';
    }

    // Si ya está logueado, ir directo al dashboard
    if (this.auth.isLoggedIn) {
      this.router.navigate(['/dashboard']);
    }
  }

  loginWithGoogle(): void {
    this.auth.loginWithGoogle();
  }
}