import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../assets/environment/environment';
import { MemberDTO } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class MembersService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/api/members`;

  findAll(): Observable<MemberDTO[]> {
    return this.http.get<MemberDTO[]>(this.endpoint);
  }

  findById(id: string): Observable<MemberDTO> {
    return this.http.get<MemberDTO>(`${this.endpoint}/${id}`);
  }

  findByLabAcronym(labAcronym: string): Observable<MemberDTO[]> {
    return this.http.get<MemberDTO[]>(`${this.endpoint}/lab/${labAcronym}`);
  }

  create(payload: MemberDTO): Observable<MemberDTO> {
    return this.http.post<MemberDTO>(this.endpoint, payload);
  }

  update(id: string, payload: MemberDTO): Observable<MemberDTO> {
    return this.http.put<MemberDTO>(`${this.endpoint}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
