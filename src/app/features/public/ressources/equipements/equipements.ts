import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, tap } from 'rxjs';

import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero';
import { LabsService } from '../../../../core/services/labs.service';
import { EquipmentDTO, EquipmentCategory } from '../../../../core/models/api.models';
import { ListBlockComponent } from '../../../../shared/components/public/list-block/list-block';
import { SectionTitleComponent } from '../../../../shared/components/public/section-title/section-title';
import { EmptyStateComponent } from '../../../../shared/components/public/empty-state/empty-state';
import { SpinnerComponent } from '../../../../shared/components/public/spinner/spinner';

@Component({
  selector: 'app-equipements',
  imports: [PageHeroComponent, ListBlockComponent, SectionTitleComponent, EmptyStateComponent, SpinnerComponent],
  templateUrl: './equipements.html',
  styleUrl: './equipements.css',
})
export class Equipements {
  private readonly labsService = inject(LabsService);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  private readonly allEquipments = toSignal(this.labsService.findAll().pipe(
    tap(() => {
      this.loading.set(true);
      this.error.set('');
    }),
    map((labs) => labs.flatMap((lab) => lab.equipments ?? [])),
    catchError(() => {
      this.error.set('Impossible de charger les équipements.');
      return of<EquipmentDTO[]>([]);
    }),
    tap(() => this.loading.set(false))
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
