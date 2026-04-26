import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../assets/environment/environment';
import { CollaborationDTO } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class CollaborationsService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/api/collaborations`;

  findAll(): Observable<CollaborationDTO[]> {
    return this.http.get<CollaborationDTO[]>(this.endpoint);
  }

  findById(id: string): Observable<CollaborationDTO> {
    return this.http.get<CollaborationDTO>(`${this.endpoint}/${id}`);
  }

  findByLabAcronym(labAcronym: string): Observable<CollaborationDTO[]> {
    return this.http.get<CollaborationDTO[]>(`${this.endpoint}/lab/${labAcronym}`);
  }

  create(payload: CollaborationDTO): Observable<CollaborationDTO> {
    return this.http.post<CollaborationDTO>(this.endpoint, payload);
  }

  update(id: string, payload: CollaborationDTO): Observable<CollaborationDTO> {
    return this.http.put<CollaborationDTO>(`${this.endpoint}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}