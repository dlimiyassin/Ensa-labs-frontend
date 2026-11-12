import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-config';

export type UploadFolder = 'members' | 'collaborations' | 'labs' | 'misc';

@Injectable({ providedIn: 'root' })
export class FilesService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/api/files`;

  /** Public URL of an uploaded image, usable directly in an <img src>. */
  imageUrl(path: string | null | undefined): string | null {
    return path ? `${this.endpoint}/get-image?path=${encodeURIComponent(path)}` : null;
  }

  getImage(path: string): Observable<Blob> {
    const params = new HttpParams().set('path', path);
    return this.http.get(`${this.endpoint}/get-image`, { params, responseType: 'blob' });
  }

  /** Uploads a JPEG / PNG / WEBP image and returns its stored path. */
  uploadImage(file: File, folder: UploadFolder): Observable<{ path: string }> {
    const body = new FormData();
    body.append('file', file);
    body.append('folder', folder);
    return this.http.post<{ path: string }>(`${this.endpoint}/image`, body);
  }

  deleteImage(path: string): Observable<void> {
    const params = new HttpParams().set('path', path);
    return this.http.delete<void>(`${this.endpoint}/image`, { params });
  }
}
