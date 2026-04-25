import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, finalize, of, tap } from 'rxjs';

import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero';
import { LabsService } from '../../../../core/services/labs.service';
import { LabDTO } from '../../../../core/models/api.models';
import { SectionTitleComponent } from '../../../../shared/components/public/section-title/section-title';
import { EmptyStateComponent } from '../../../../shared/components/public/empty-state/empty-state';
import { SpinnerComponent } from '../../../../shared/components/public/spinner/spinner';

interface CollaborationCardModel {
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-partenariats',
  imports: [PageHeroComponent, SectionTitleComponent, EmptyStateComponent, SpinnerComponent],
  templateUrl: './partenariats.html',
  styleUrl: './partenariats.css',
})
export class Partenariats {
  private readonly labsService = inject(LabsService);

  protected readonly loading = signal(true);

  private readonly labs = toSignal(this.labsService.findAll().pipe(
    tap(() => this.loading.set(true)),
    catchError(() => of<LabDTO[]>([])),
    finalize(() => this.loading.set(false))
  ), { initialValue: [] });

  protected readonly cards = computed<CollaborationCardModel[]>(() => this.labs().map((lab) => ({
    title: lab.titleFr ?? lab.acronym ?? 'Laboratoire',
    subtitle: [lab.establishment ?? 'Établissement national', lab.university ?? 'Université partenaire']
      .filter(Boolean)
      .join(' • ')
  })));

  protected readonly hasData = computed(() => this.cards().length > 0);
}
