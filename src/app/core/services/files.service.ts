import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';

@Injectable({ providedIn: 'root' })
export class FilesService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/api/files`;

  getImage(path: string): Observable<Blob> {
    const params = new HttpParams().set('path', path);
    return this.http.get(`${this.endpoint}/get-image`, { params, responseType: 'blob' });
  }

  deleteImage(path: string): Observable<void> {
    const params = new HttpParams().set('path', path);
    return this.http.delete<void>(`${this.endpoint}/image`, { params });
  }
}
