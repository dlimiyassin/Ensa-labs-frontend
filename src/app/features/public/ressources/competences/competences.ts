import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';

import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero';
import { CompetenceDTO, CompetenceType } from '../../../../core/models/api.models';
import { CompetencesService } from '../../../../core/services/competences.service';
import { SectionTitleComponent } from '../../../../shared/components/public/section-title/section-title';
import { EmptyStateComponent } from '../../../../shared/components/public/empty-state/empty-state';
import { SpinnerComponent } from '../../../../shared/components/public/spinner/spinner';
import {
  ResourceCatalogComponent,
  ResourceGroup
} from '../../../../shared/components/public/resource-catalog/resource-catalog';

const TYPES: readonly { key: CompetenceType; title: string; description: string; icon: string }[] = [
  { key: 'SCIENTIFIC', title: 'Compétences scientifiques et méthodologiques', description: 'Expertises disciplinaires et méthodes de recherche.', icon: 'pi pi-book' },
  { key: 'TECHNOLOGICAL', title: 'Savoir-faire technologique', description: 'Maîtrise d’outils, de procédés et de technologies.', icon: 'pi pi-wrench' },
  { key: 'SECTORIAL', title: 'Compétences sectorielles', description: 'Connaissance des secteurs d’application.', icon: 'pi pi-briefcase' },
  { key: 'INNOVATION', title: 'Innovation et transfert', description: 'Valorisation, transfert et accompagnement de projets.', icon: 'pi pi-lightbulb' }
];

@Component({
  selector: 'app-competences',
  imports: [PageHeroComponent, SectionTitleComponent, EmptyStateComponent, SpinnerComponent, ResourceCatalogComponent],
  templateUrl: './competences.html',
  styleUrl: './competences.css',
})
export class Competences {
  private readonly competencesService = inject(CompetencesService);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  private readonly allCompetences = toSignal(this.competencesService.findAll().pipe(
    catchError(() => {
      this.error.set('Impossible de charger les compétences.');
      return of<CompetenceDTO[]>([]);
    }),
    tap(() => this.loading.set(false))
  ), { initialValue: [] });

  protected readonly groups = computed<ResourceGroup[]>(() => TYPES.map((type) => ({
    ...type,
    items: this.allCompetences()
      .filter((item) => item.type === type.key)
      .map((item) => ({ label: item.description ?? 'Compétence', lab: item.labAcronym }))
  })));

  protected readonly hasData = computed(() => this.allCompetences().length > 0);
}
