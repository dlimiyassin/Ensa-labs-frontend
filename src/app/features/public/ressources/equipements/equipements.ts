import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';

import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero';
import { EquipmentCategory, EquipmentDTO } from '../../../../core/models/api.models';
import { EquipmentsService } from '../../../../core/services/equipments.service';
import { SectionTitleComponent } from '../../../../shared/components/public/section-title/section-title';
import { EmptyStateComponent } from '../../../../shared/components/public/empty-state/empty-state';
import { SpinnerComponent } from '../../../../shared/components/public/spinner/spinner';
import {
  ResourceCatalogComponent,
  ResourceGroup
} from '../../../../shared/components/public/resource-catalog/resource-catalog';

const CATEGORIES: readonly { key: EquipmentCategory; title: string; description: string; icon: string }[] = [
  { key: 'LAB', title: 'Équipements scientifiques du laboratoire', description: 'Matériel de recherche propre aux laboratoires.', icon: 'pi pi-cog' },
  { key: 'SHARED', title: "Plateformes de l'établissement et de l'université", description: 'Équipements scientifiques mutualisés.', icon: 'pi pi-share-alt' },
  { key: 'UNIVERSITY', title: 'Dotations universitaires', description: 'Équipements acquis via les dotations de recherche.', icon: 'pi pi-building-columns' },
  { key: 'IT', title: 'Équipements informatiques', description: 'Postes, serveurs et moyens de calcul.', icon: 'pi pi-desktop' }
];

@Component({
  selector: 'app-equipements',
  imports: [PageHeroComponent, SectionTitleComponent, EmptyStateComponent, SpinnerComponent, ResourceCatalogComponent],
  templateUrl: './equipements.html',
  styleUrl: './equipements.css',
})
export class Equipements {
  private readonly equipmentsService = inject(EquipmentsService);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  private readonly allEquipments = toSignal(this.equipmentsService.findAll().pipe(
    catchError(() => {
      this.error.set('Impossible de charger les équipements.');
      return of<EquipmentDTO[]>([]);
    }),
    tap(() => this.loading.set(false))
  ), { initialValue: [] });

  protected readonly groups = computed<ResourceGroup[]>(() => CATEGORIES.map((category) => ({
    ...category,
    items: this.allEquipments()
      .filter((item) => item.category === category.key)
      .map((item) => ({ label: item.name ?? 'Équipement', lab: item.labAcronym }))
      .sort((a, b) => a.label.localeCompare(b.label))
  })));

  protected readonly hasData = computed(() => this.allEquipments().length > 0);
}
