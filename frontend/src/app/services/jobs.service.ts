import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface JobResponse {
  job_id: number;
}

// ── Payloads por operación ────────────────────────────────
export interface AltaPayload {
  employee_username:        string; // carlos.alvarenga
  employee_oracle_username: string; // CARLOS_ALVARENGA (auto-generado)
  employee_full_name:       string;
  employee_password:        string;
  employee_role:            string; // APP_READONLY | APP_OPERATOR
}

export interface BajaPayload {
  employee_username:        string;
  employee_oracle_username: string;
}

export interface CambioRolPayload {
  employee_oracle_username: string;
  employee_role_anterior:   string;
  employee_role:            string;
}

export interface ResetPayload {
  employee_username: string;
  employee_password: string;
}

// ── Utilidad de transformación de username ────────────────
export function toOracleUsername(adUsername: string): string {
  return adUsername.toUpperCase().replace(/\./g, '_');
}

@Injectable({ providedIn: 'root' })
export class JobsService {
  constructor(private http: HttpClient) {}

  // ── CIS ──────────────────────────────────────────────────
  cisAudit(): Observable<JobResponse> {
    return this.http.post<JobResponse>('/api/jobs/cis', {});
  }

  // ── Empleados ─────────────────────────────────────────────
  employeeAlta(payload: AltaPayload): Observable<JobResponse> {
    return this.http.post<JobResponse>('/api/jobs/employees/alta', payload);
  }

  employeeBaja(payload: BajaPayload): Observable<JobResponse> {
    return this.http.post<JobResponse>('/api/jobs/employees/baja', payload);
  }

  employeeCambioRol(payload: CambioRolPayload): Observable<JobResponse> {
    return this.http.post<JobResponse>('/api/jobs/employees/cambio-rol', payload);
  }

  employeeReset(payload: ResetPayload): Observable<JobResponse> {
    return this.http.post<JobResponse>('/api/jobs/employees/reset', payload);
  }

  // ── Efímeros (pendiente de implementar en backend) ────────
  ephemeralCreate(envId: string): Observable<JobResponse> {
    return this.http.post<JobResponse>('/api/jobs/ephemeral/create', { envId });
  }

  ephemeralDelete(envId: string): Observable<JobResponse> {
    return this.http.post<JobResponse>('/api/jobs/ephemeral/delete', { envId });
  }
}