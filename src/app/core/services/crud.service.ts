import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-config';

/** Standard REST resource exposed by the backend: /api/{resource}[/{id}|/lab/{acronym}]. */
export abstract class CrudService<T> {
  protected readonly http = inject(HttpClient);
  protected readonly endpoint: string;

  protected constructor(resource: string) {
    this.endpoint = `${API_BASE_URL}/api/${resource}`;
  }

  findAll(): Observable<T[]> {
    return this.http.get<T[]>(this.endpoint);
  }

  findById(id: string): Observable<T> {
    return this.http.get<T>(`${this.endpoint}/${id}`);
  }

  findByLabAcronym(labAcronym: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.endpoint}/lab/${encodeURIComponent(labAcronym)}`);
  }

  create(payload: T): Observable<T> {
    return this.http.post<T>(this.endpoint, payload);
  }

  update(id: string, payload: T): Observable<T> {
    return this.http.put<T>(`${this.endpoint}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
