import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../assets/environment/environment';
import { ProductionDTO } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ProductionsService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/api/productions`;

  findAll(): Observable<ProductionDTO[]> {
    return this.http.get<ProductionDTO[]>(this.endpoint);
  }

  findById(id: string): Observable<ProductionDTO> {
    return this.http.get<ProductionDTO>(`${this.endpoint}/${id}`);
  }

  findByLabAcronym(labAcronym: string): Observable<ProductionDTO> {
    return this.http.get<ProductionDTO>(`${this.endpoint}/lab/${labAcronym}`);
  }

  create(payload: ProductionDTO): Observable<ProductionDTO> {
    return this.http.post<ProductionDTO>(this.endpoint, payload);
  }

  update(id: string, payload: ProductionDTO): Observable<ProductionDTO> {
    return this.http.put<ProductionDTO>(`${this.endpoint}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
