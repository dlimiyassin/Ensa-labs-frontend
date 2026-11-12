import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorDetails, MemberDTO } from '../../../core/models/api.models';

/** Human readable message for a failed API call (French UI). */
export function apiErrorMessage(error: unknown, fallback = "L'opération a échoué."): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }
  if (error.status === 0) return 'Serveur injoignable.';
  if (error.status === 401) return 'Session expirée, veuillez vous reconnecter.';
  if (error.status === 403) return "Vous n'avez pas les droits pour cette action.";

  const body = error.error as ApiErrorDetails | null;
  if (body?.errors && Object.keys(body.errors).length > 0) {
    return Object.entries(body.errors).map(([field, message]) => `${field} : ${message}`).join(' · ');
  }
  return body?.message || fallback;
}

export function memberName(member: MemberDTO | null | undefined): string {
  return `${member?.firstName ?? ''} ${member?.lastName ?? ''}`.trim();
}

/** 'YYYY-MM-DD' (backend LocalDate) -> Date, local time. */
export function parseIsoDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return year ? new Date(year, (month || 1) - 1, day || 1) : null;
}

/** Date -> 'YYYY-MM-DD' without timezone shift. */
export function toIsoDate(value: Date | null | undefined): string | null {
  if (!value) return null;
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${value.getFullYear()}-${month}-${day}`;
}

/** Splits a textarea into trimmed, non-empty lines (one value per line, commas also accepted). */
export function splitLines(value: string | null | undefined): string[] {
  return (value ?? '')
    .split(/[\n;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Case and accent insensitive "contains" used by the list search boxes. */
export function matchesSearch(term: string, ...values: (string | number | null | undefined)[]): boolean {
  const needle = normalize(term);
  if (!needle) return true;
  return values.some((value) => normalize(String(value ?? '')).includes(needle));
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
