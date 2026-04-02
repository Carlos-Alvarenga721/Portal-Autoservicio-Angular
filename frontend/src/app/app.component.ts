import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `,
  styles: [`:host { display: block; min-height: 100vh; background: #f0f2f5; }`]
})
export class AppComponent implements OnInit {

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Captura el token que Google devuelve en /?token=...
    const handled = this.auth.handleOAuthCallback();
    if (handled) {
      this.router.navigate(['/dashboard']);
    }
  }
}