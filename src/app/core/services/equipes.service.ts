import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../assets/environment/environment';
import { EquipeDTO } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class EquipesService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/api/equipes`;

  findAll(): Observable<EquipeDTO[]> {
    return this.http.get<EquipeDTO[]>(this.endpoint);
  }

  findById(id: string): Observable<EquipeDTO> {
    return this.http.get<EquipeDTO>(`${this.endpoint}/${id}`);
  }

  findByLabAcronym(labAcronym: string): Observable<EquipeDTO[]> {
    return this.http.get<EquipeDTO[]>(`${this.endpoint}/lab/${labAcronym}`);
  }

  create(payload: EquipeDTO): Observable<EquipeDTO> {
    return this.http.post<EquipeDTO>(this.endpoint, payload);
  }

  update(id: string, payload: EquipeDTO): Observable<EquipeDTO> {
    return this.http.put<EquipeDTO>(`${this.endpoint}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
