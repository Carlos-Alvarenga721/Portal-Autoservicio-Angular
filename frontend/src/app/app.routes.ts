import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login',     loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'cis',       loadComponent: () => import('./pages/cis/cis.component').then(m => m.CisComponent), canActivate: [authGuard], data: { roles: ['operador'] } },
  { path: 'employees', loadComponent: () => import('./pages/employees/employees.component').then(m => m.EmployeesComponent), canActivate: [authGuard], data: { roles: ['operador', 'soporte'] } },
  { path: 'ephemeral', loadComponent: () => import('./pages/ephemeral/ephemeral.component').then(m => m.EphemeralComponent), canActivate: [authGuard], data: { roles: ['operador'] } },
  { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**',        redirectTo: 'dashboard' },
];
