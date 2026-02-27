import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface JobResponse {
  job_id: number;
}

export interface EmployeePayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  department: string;
  role: string;
  adGroups?: string;
}

@Injectable({ providedIn: 'root' })
export class JobsService {
  constructor(private http: HttpClient) {}

  cisAudit(): Observable<JobResponse> {
    return this.http.post<JobResponse>('/api/jobs/cis/audit', {});
  }

  employeeCreate(payload: EmployeePayload): Observable<JobResponse> {
    return this.http.post<JobResponse>('/api/jobs/employees/create', payload);
  }

  ephemeralCreate(envId: string): Observable<JobResponse> {
    return this.http.post<JobResponse>('/api/jobs/ephemeral/create', { envId });
  }

  ephemeralDelete(envId: string): Observable<JobResponse> {
    return this.http.post<JobResponse>('/api/jobs/ephemeral/delete', { envId });
  }
}
