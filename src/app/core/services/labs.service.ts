import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../assets/environment/environment';
import { LabDTO } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class LabsService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/api/labs`;

  findAll(): Observable<LabDTO[]> {
    return this.http.get<LabDTO[]>(this.endpoint);
  }

  findById(id: string): Observable<LabDTO> {
    return this.http.get<LabDTO>(`${this.endpoint}/${id}`);
  }

  findByAcronym(acronym: string): Observable<LabDTO> {
    return this.http.get<LabDTO>(`${this.endpoint}/acronym/${acronym}`);
  }

  findByDepartmentName(departmentName: string): Observable<LabDTO[]> {
    return this.http.get<LabDTO[]>(`${this.endpoint}/department/${departmentName}`);
  }

  findByEstablishment(establishment: string): Observable<LabDTO[]> {
    return this.http.get<LabDTO[]>(`${this.endpoint}/establishment/${establishment}`);
  }

  create(payload: LabDTO): Observable<LabDTO> {
    return this.http.post<LabDTO>(this.endpoint, payload);
  }

  update(id: string, payload: LabDTO): Observable<LabDTO> {
    return this.http.put<LabDTO>(`${this.endpoint}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
