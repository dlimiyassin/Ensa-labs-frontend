import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { PublicationDTO } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class PublicationsService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/api/publications`;

  findAll(): Observable<PublicationDTO[]> {
    return this.http.get<PublicationDTO[]>(this.endpoint);
  }

  findById(id: string): Observable<PublicationDTO> {
    return this.http.get<PublicationDTO>(`${this.endpoint}/${id}`);
  }

  findByLabAcronym(labAcronym: string): Observable<PublicationDTO[]> {
    return this.http.get<PublicationDTO[]>(`${this.endpoint}/lab/${labAcronym}`);
  }

  create(payload: PublicationDTO): Observable<PublicationDTO> {
    return this.http.post<PublicationDTO>(this.endpoint, payload);
  }

  update(id: string, payload: PublicationDTO): Observable<PublicationDTO> {
    return this.http.put<PublicationDTO>(`${this.endpoint}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
