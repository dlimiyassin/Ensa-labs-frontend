import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../assets/environment/environment';
import { UserDTO } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/api/users`;

  findAll(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(this.endpoint);
  }

  findById(id: string): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.endpoint}/${id}`);
  }

  create(payload: UserDTO): Observable<UserDTO> {
    return this.http.post<UserDTO>(this.endpoint, payload);
  }

  update(id: string, payload: UserDTO): Observable<UserDTO> {
    return this.http.put<UserDTO>(`${this.endpoint}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
