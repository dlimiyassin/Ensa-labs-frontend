import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';

import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero';
import { SectionTitleComponent } from '../../../../shared/components/public/section-title/section-title';
import { EmptyStateComponent } from '../../../../shared/components/public/empty-state/empty-state';
import { SpinnerComponent } from '../../../../shared/components/public/spinner/spinner';
import { CollaborationsService } from '../../../../core/services/collaborations.service';
import { CollaborationDTO } from '../../../../core/models/api.models';

@Component({
  selector: 'app-partenariats-industriels',
  imports: [PageHeroComponent, SectionTitleComponent, EmptyStateComponent, SpinnerComponent],
  templateUrl: './partenariats.html',
  styleUrl: './partenariats.css',
})
export class PartenariatsIndustriels {
  private readonly collaborationsService = inject(CollaborationsService);

  protected readonly loading = signal(true);
  protected readonly error = signal('');

  private readonly collaborations = toSignal(this.collaborationsService.findAllIndustrial().pipe(
    tap(() => {
      this.loading.set(true);
      this.error.set('');
    }),
    catchError(() => {
      this.error.set('Impossible de charger les partenariats industriels.');
      return of<CollaborationDTO[]>([]);
    }),
    tap(() => this.loading.set(false))
  ), { initialValue: [] });

  protected readonly hasData = computed(() => this.collaborations().length > 0);

  protected readonly sections = computed(() => {
    const byScope = new Map<string, CollaborationDTO[]>();

    for (const collaboration of this.collaborations()) {
      const key = collaboration.scope === 'INTERNATIONAL'
        ? 'International'
        : collaboration.scope === 'REGIONAL'
          ? 'Régional'
          : 'National';
      const current = byScope.get(key) ?? [];
      current.push(collaboration);
      byScope.set(key, current);
    }

    return Array.from(byScope.entries()).map(([title, items]) => ({ title, items }));
  });

  protected trackByCollaboration(index: number, collaboration: CollaborationDTO): string {
    return String(collaboration.id ?? `${collaboration.organization}-${collaboration.nature}-${index}`);
  }
}
