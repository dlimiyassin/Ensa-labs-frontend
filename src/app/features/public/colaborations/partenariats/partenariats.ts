import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';

import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero';
import { LabsService } from '../../../../core/services/labs.service';
import { LabDTO } from '../../../../core/models/api.models';
import { ListBlockComponent } from '../../../../shared/components/public/list-block/list-block';
import { SectionTitleComponent } from '../../../../shared/components/public/section-title/section-title';
import { EmptyStateComponent } from '../../../../shared/components/public/empty-state/empty-state';

@Component({
  selector: 'app-partenariats',
  imports: [PageHeroComponent, ListBlockComponent, SectionTitleComponent, EmptyStateComponent],
  templateUrl: './partenariats.html',
  styleUrl: './partenariats.css',
})
export class Partenariats {
  private readonly labsService = inject(LabsService);

  private readonly labs = toSignal(this.labsService.findAll().pipe(catchError(() => of<LabDTO[]>([]))), { initialValue: [] });

  protected readonly national = computed(() => this.labs().map((lab) => `${lab.acronym}: ${lab.establishment ?? 'Établissement national'}`));
  protected readonly international = computed(() => this.labs().flatMap((lab) => (lab.tags ?? [])
    .map((tag) => tag.name)
    .filter((tag): tag is string => !!tag)
    .map((tag) => `${lab.acronym}: ${tag}`)));
  protected readonly academic = computed(() => this.labs().map((lab) => `${lab.acronym}: ${lab.university ?? 'Université partenaire'}`));

  protected readonly hasData = computed(() => this.labs().length > 0);
}
