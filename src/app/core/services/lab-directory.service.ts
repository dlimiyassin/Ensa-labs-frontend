import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, shareReplay } from 'rxjs';
import { LabsService } from './labs.service';

export interface LabSummary {
  readonly acronym: string;
  readonly title: string;
}

/** Lightweight, cached list of the labs used by the public navigation (navbar, footer). */
@Injectable({ providedIn: 'root' })
export class LabDirectoryService {
  private readonly labsService = inject(LabsService);

  private readonly labs$ = this.labsService.findAll().pipe(
    map((labs) => labs
      .filter((lab) => !!lab.acronym)
      .map((lab) => ({ acronym: lab.acronym as string, title: (lab.titleFr ?? lab.titleEn ?? '').trim() }))
      .sort((a, b) => a.acronym.localeCompare(b.acronym))),
    catchError(() => of<LabSummary[]>([])),
    shareReplay(1)
  );

  readonly labs = toSignal(this.labs$, { initialValue: [] as LabSummary[] });
}
