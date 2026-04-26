import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, tap } from 'rxjs';

import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero';
import { LabsService } from '../../../../core/services/labs.service';
import { CompetenceDTO, CompetenceType } from '../../../../core/models/api.models';
import { ListBlockComponent } from '../../../../shared/components/public/list-block/list-block';
import { SectionTitleComponent } from '../../../../shared/components/public/section-title/section-title';
import { EmptyStateComponent } from '../../../../shared/components/public/empty-state/empty-state';
import { SpinnerComponent } from '../../../../shared/components/public/spinner/spinner';

@Component({
  selector: 'app-competences',
  imports: [PageHeroComponent, ListBlockComponent, SectionTitleComponent, EmptyStateComponent, SpinnerComponent],
  templateUrl: './competences.html',
  styleUrl: './competences.css',
})
export class Competences {
  private readonly labsService = inject(LabsService);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  private readonly allCompetences = toSignal(this.labsService.findAll().pipe(
    tap(() => {
      this.loading.set(true);
      this.error.set('');
    }),
    map((labs) => labs.flatMap((lab) => lab.competences ?? [])),
    catchError(() => {
      this.error.set('Impossible de charger les compétences.');
      return of<CompetenceDTO[]>([]);
    }),
    tap(() => this.loading.set(false))
  ), { initialValue: [] });

  protected readonly byType = computed(() => ({
    SCIENTIFIC: this.typeItems('SCIENTIFIC'),
    TECHNOLOGICAL: this.typeItems('TECHNOLOGICAL'),
    SECTORIAL: this.typeItems('SECTORIAL'),
    INNOVATION: this.typeItems('INNOVATION')
  }));

  protected readonly hasData = computed(() => this.allCompetences().length > 0);

  private typeItems(type: CompetenceType): string[] {
    return this.allCompetences()
      .filter((item) => item.type === type)
      .map((item) => `${item.description ?? 'Compétence'}${item.labAcronym ? ` (${item.labAcronym})` : ''}`);
  }
}
