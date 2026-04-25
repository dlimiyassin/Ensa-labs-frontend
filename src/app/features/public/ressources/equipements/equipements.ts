import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';

import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero';
import { LabsService } from '../../../../core/services/labs.service';
import { EquipmentDTO, EquipmentCategory } from '../../../../core/models/api.models';
import { ListBlockComponent } from '../../../../shared/components/public/list-block/list-block';
import { SectionTitleComponent } from '../../../../shared/components/public/section-title/section-title';
import { EmptyStateComponent } from '../../../../shared/components/public/empty-state/empty-state';

@Component({
  selector: 'app-equipements',
  imports: [PageHeroComponent, ListBlockComponent, SectionTitleComponent, EmptyStateComponent],
  templateUrl: './equipements.html',
  styleUrl: './equipements.css',
})
export class Equipements {
  private readonly labsService = inject(LabsService);

  private readonly allEquipments = toSignal(this.labsService.findAll().pipe(
    map((labs) => labs.flatMap((lab) => lab.equipments ?? [])),
    catchError(() => of<EquipmentDTO[]>([]))
  ), { initialValue: [] });

  protected readonly byCategory = computed(() => ({
    LAB: this.categoryItems('LAB'),
    UNIVERSITY: this.categoryItems('UNIVERSITY'),
    SHARED: this.categoryItems('SHARED'),
    IT: this.categoryItems('IT')
  }));

  protected readonly hasData = computed(() => this.allEquipments().length > 0);

  private categoryItems(category: EquipmentCategory): string[] {
    return this.allEquipments()
      .filter((item) => item.category === category)
      .map((item) => `${item.name ?? 'Équipement'}${item.labAcronym ? ` (${item.labAcronym})` : ''}`);
  }
}
