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
  selector: 'app-partenariats-industriels',
  imports: [PageHeroComponent, SectionTitleComponent, EmptyStateComponent, SpinnerComponent],
  templateUrl: './partenariats.html',
  styleUrl: './partenariats.css',
})
export class PartenariatsIndustriels {
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
      this.error.set('Impossible de charger les partenariats industriels.');
      return of<LabDTO[]>([]);
    }),
    tap(() => this.loading.set(false))
  ), { initialValue: [] });

  protected readonly organizations = computed<CollaborationCard[]>(() => this.labs().map((lab) => ({
    title: `${lab.acronym ?? 'LAB'} — Organisation`,
    description: lab.establishment ?? 'Partenaire industriel',
    image: this.fallbackImage
  })));
  protected readonly themes = computed<CollaborationCard[]>(() => this.labs().flatMap((lab) => (lab.domainesRecherche ?? [])
    .map((domain) => domain.name)
    .filter((name): name is string => !!name)
    .map((name) => ({
      title: `${lab.acronym ?? 'LAB'} — Thématique`,
      description: name,
      image: this.fallbackImage
    }))));
  protected readonly natures = computed<CollaborationCard[]>(() => this.labs().map((lab) => ({
    title: `${lab.acronym ?? 'LAB'} — Nature`,
    description: 'Co-développement et transfert technologique',
    image: this.fallbackImage
  })));

  protected readonly hasData = computed(() => this.labs().length > 0);
}
