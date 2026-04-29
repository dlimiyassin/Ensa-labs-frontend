import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';

import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero';
import { SectionTitleComponent } from '../../../../shared/components/public/section-title/section-title';
import { EmptyStateComponent } from '../../../../shared/components/public/empty-state/empty-state';
import { SpinnerComponent } from '../../../../shared/components/public/spinner/spinner';
import { CollaborationsService } from '../../../../core/services/collaborations.service';
import { CollaborationDTO } from '../../../../core/models/api.models';

type ScopeFilter = 'NATIONAL' | 'INTERNATIONAL';

@Component({
  selector: 'app-partenariats',
  imports: [PageHeroComponent, SectionTitleComponent, EmptyStateComponent, SpinnerComponent],
  templateUrl: './partenariats.html',
  styleUrl: './partenariats.css',
})
export class Partenariats {
  private readonly collaborationsService = inject(CollaborationsService);

  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly cardImage = '/images/university.png';
  protected readonly scopeFilters: ScopeFilter[] = ['NATIONAL', 'INTERNATIONAL'];
  protected readonly selectedScope = signal<ScopeFilter>('NATIONAL');

  private readonly collaborations = toSignal(this.collaborationsService.findAllAcademic().pipe(
    tap(() => {
      this.loading.set(true);
      this.error.set('');
    }),
    catchError(() => {
      this.error.set('Impossible de charger les partenariats académiques.');
      return of<CollaborationDTO[]>([]);
    }),
    tap(() => this.loading.set(false))
  ), { initialValue: [] });

  protected readonly filteredCollaborations = computed(() =>
    this.collaborations().filter((collaboration) =>
      collaboration.scope === 'NATIONAL' || collaboration.scope === 'INTERNATIONAL'
    )
  );

  protected readonly hasData = computed(() => this.filteredCollaborations().length > 0);

  protected readonly visibleCollaborations = computed(() =>
    this.filteredCollaborations().filter((collaboration) => collaboration.scope === this.selectedScope())
  );

  protected scopeLabel(scope: ScopeFilter): string {
    return scope === 'NATIONAL' ? 'National' : 'International';
  }

  protected setSelectedScope(scope: ScopeFilter): void {
    this.selectedScope.set(scope);
  }

  protected trackByCollaboration(index: number, collaboration: CollaborationDTO): string {
    return String(collaboration.id ?? `${collaboration.organization}-${collaboration.theme}-${index}`);
  }
}
