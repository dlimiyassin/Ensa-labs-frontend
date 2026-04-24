import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { RoleCriteria, RoleDto } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/api/roles`;

  findAll(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(`${this.endpoint}/`);
  }

  findByCriteria(criteria: RoleCriteria): Observable<RoleDto[]> {
    return this.http.post<RoleDto[]>(`${this.endpoint}/find-by-criteria`, criteria);
  }

  findById(id: string): Observable<RoleDto> {
    return this.http.get<RoleDto>(`${this.endpoint}/id/${id}`);
  }

  save(payload: RoleDto): Observable<RoleDto> {
    return this.http.post<RoleDto>(`${this.endpoint}/`, payload);
  }

  update(payload: RoleDto): Observable<RoleDto> {
    return this.http.put<RoleDto>(`${this.endpoint}/`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/id/${id}`);
  }
}
