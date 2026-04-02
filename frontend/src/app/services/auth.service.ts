import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  email: string;
  role: 'commercial' | 'ops';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(this.loadUser());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): User | null {
    const raw = localStorage.getItem('aap_user');
    return raw ? JSON.parse(raw) : null;
  }

  get token(): string | null {
    return localStorage.getItem('aap_token');
  }

  get user(): User | null {
    return this.userSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  /** Llama a este método al cargar la app para capturar el token que Google devuelve en la URL */
  handleOAuthCallback(): boolean {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    const role  = params.get('role');

    if (token && email && role) {
      localStorage.setItem('aap_token', token);
      const user: User = { email, role: role as User['role'] };
      localStorage.setItem('aap_user', JSON.stringify(user));
      this.userSubject.next(user);
      // Limpia los params de la URL
      window.history.replaceState({}, '', '/dashboard');
      return true;
    }
    return false;
  }

  loginWithGoogle(): void {
    window.location.href = '/api/auth/google';
  }

  me(): Observable<User> {
    return this.http.get<User>('/api/auth/me');
  }

  logout(): void {
    localStorage.removeItem('aap_token');
    localStorage.removeItem('aap_user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}