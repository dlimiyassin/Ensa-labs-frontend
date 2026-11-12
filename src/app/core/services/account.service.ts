import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-config';
import { CurrentUserDTO, DashboardStatsDTO, PasswordChangeDTO } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/api/account`;

  me(): Observable<CurrentUserDTO> {
    return this.http.get<CurrentUserDTO>(`${this.endpoint}/me`);
  }

  changePassword(payload: PasswordChangeDTO): Observable<void> {
    return this.http.put<void>(`${this.endpoint}/password`, payload);
  }

  stats(labAcronym?: string | null): Observable<DashboardStatsDTO> {
    const params = labAcronym ? new HttpParams().set('lab', labAcronym) : undefined;
    return this.http.get<DashboardStatsDTO>(`${this.endpoint}/stats`, { params });
  }
}
