import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  email: string;
  role: 'commercial' | 'ops';
}

interface LoginResponse {
  token: string;
  email: string;
  role: string;
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

  login(email: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', { email }).pipe(
      tap((res) => {
        localStorage.setItem('aap_token', res.token);
        const user: User = { email: res.email, role: res.role as User['role'] };
        localStorage.setItem('aap_user', JSON.stringify(user));
        this.userSubject.next(user);
      })
    );
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
