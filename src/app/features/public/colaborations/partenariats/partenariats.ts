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
  selector: 'app-partenariats',
  imports: [PageHeroComponent, SectionTitleComponent, EmptyStateComponent, SpinnerComponent],
  templateUrl: './partenariats.html',
  styleUrl: './partenariats.css',
})
export class Partenariats {
  private readonly collaborationsService = inject(CollaborationsService);

  protected readonly loading = signal(true);
  protected readonly error = signal('');

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

  protected readonly hasData = computed(() => this.collaborations().length > 0);

  protected readonly collaborationsByScope = computed(() => {
    const sections: Array<{ title: string; items: CollaborationDTO[] }> = [
      { title: 'Régional', items: [] },
      { title: 'National', items: [] },
      { title: 'International', items: [] }
    ];

    for (const collaboration of this.collaborations()) {
      switch (collaboration.scope) {
        case 'REGIONAL':
          sections[0].items.push(collaboration);
          break;
        case 'NATIONAL':
          sections[1].items.push(collaboration);
          break;
        case 'INTERNATIONAL':
          sections[2].items.push(collaboration);
          break;
        default:
          sections[1].items.push(collaboration);
      }
    }

    return sections.filter((section) => section.items.length > 0);
  });

  protected trackByCollaboration(index: number, collaboration: CollaborationDTO): string {
    return String(collaboration.id ?? `${collaboration.organization}-${collaboration.theme}-${index}`);
  }
}
