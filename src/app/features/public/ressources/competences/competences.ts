import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';

import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero';
import { LabsService } from '../../../../core/services/labs.service';
import { CompetenceDTO, CompetenceType } from '../../../../core/models/api.models';
import { ListBlockComponent } from '../../../../shared/components/public/list-block/list-block';
import { SectionTitleComponent } from '../../../../shared/components/public/section-title/section-title';
import { EmptyStateComponent } from '../../../../shared/components/public/empty-state/empty-state';

@Component({
  selector: 'app-competences',
  imports: [PageHeroComponent, ListBlockComponent, SectionTitleComponent, EmptyStateComponent],
  templateUrl: './competences.html',
  styleUrl: './competences.css',
})
export class Competences {
  private readonly labsService = inject(LabsService);

  private readonly allCompetences = toSignal(this.labsService.findAll().pipe(
    map((labs) => labs.flatMap((lab) => lab.competences ?? [])),
    catchError(() => of<CompetenceDTO[]>([]))
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
