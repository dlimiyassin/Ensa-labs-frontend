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
  selector: 'app-partenariats-industriels',
  imports: [PageHeroComponent, ListBlockComponent, SectionTitleComponent, EmptyStateComponent],
  templateUrl: './partenariats.html',
  styleUrl: './partenariats.css',
})
export class PartenariatsIndustriels {
  private readonly labsService = inject(LabsService);

  private readonly labs = toSignal(this.labsService.findAll().pipe(catchError(() => of<LabDTO[]>([]))), { initialValue: [] });

  protected readonly organizations = computed(() => this.labs().map((lab) => `${lab.acronym}: ${lab.establishment ?? 'Partenaire industriel'}`));
  protected readonly themes = computed(() => this.labs().flatMap((lab) => (lab.domainesRecherche ?? [])
    .map((domain) => domain.name)
    .filter((name): name is string => !!name)
    .map((name) => `${lab.acronym}: ${name}`)));
  protected readonly natures = computed(() => this.labs().map((lab) => `${lab.acronym}: Co-développement et transfert technologique`));

  protected readonly hasData = computed(() => this.labs().length > 0);
}
