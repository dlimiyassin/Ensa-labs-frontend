import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';

import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero';
import { LabsService } from '../../../../core/services/labs.service';
import { LabDTO } from '../../../../core/models/api.models';
import { SectionTitleComponent } from '../../../../shared/components/public/section-title/section-title';
import { EmptyStateComponent } from '../../../../shared/components/public/empty-state/empty-state';
import { SpinnerComponent } from '../../../../shared/components/public/spinner/spinner';

interface CollaborationCard {
  title: string;
  description: string;
  image: string;
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
  protected readonly error = signal('');
  protected readonly fallbackImage = 'images/colabs/building.png';

  private readonly labs = toSignal(this.labsService.findAll().pipe(
    tap(() => {
      this.loading.set(true);
      this.error.set('');
    }),
    catchError(() => {
      this.error.set('Impossible de charger les partenariats.');
      return of<LabDTO[]>([]);
    }),
    tap(() => this.loading.set(false))
  ), { initialValue: [] });

  protected readonly national = computed<CollaborationCard[]>(() => this.labs().map((lab) => ({
    title: `${lab.acronym ?? 'LAB'} — National`,
    description: lab.establishment ?? 'Établissement national',
    image: this.fallbackImage
  })));
  protected readonly international = computed<CollaborationCard[]>(() => this.labs().flatMap((lab) => (lab.tags ?? [])
    .map((tag) => tag.name)
    .filter((tag): tag is string => !!tag)
    .map((tag) => ({
      title: `${lab.acronym ?? 'LAB'} — International`,
      description: tag,
      image: this.fallbackImage
    }))));
  protected readonly academic = computed<CollaborationCard[]>(() => this.labs().map((lab) => ({
    title: `${lab.acronym ?? 'LAB'} — Académique`,
    description: lab.university ?? 'Université partenaire',
    image: this.fallbackImage
  })));

  protected readonly hasData = computed(() => this.labs().length > 0);
}
