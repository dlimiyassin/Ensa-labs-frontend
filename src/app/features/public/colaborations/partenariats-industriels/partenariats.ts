import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';

import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero';
import { SectionTitleComponent } from '../../../../shared/components/public/section-title/section-title';
import { EmptyStateComponent } from '../../../../shared/components/public/empty-state/empty-state';
import { SpinnerComponent } from '../../../../shared/components/public/spinner/spinner';
import { CollaborationsService } from '../../../../core/services/collaborations.service';
import { CollaborationDTO } from '../../../../core/models/api.models';

interface CollaborationSection {
  title: string;
  items: CollaborationDTO[];
}

@Component({
  selector: 'app-partenariats-industriels',
  imports: [PageHeroComponent, SectionTitleComponent, EmptyStateComponent, SpinnerComponent],
  templateUrl: './partenariats.html',
  styleUrl: './partenariats.css',
})
export class PartenariatsIndustriels {
  private readonly collaborationsService = inject(CollaborationsService);

  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly cardImage = '/images/colabs/building.png';
  protected readonly selectedLabBySection = signal<Record<string, string>>({});

  private readonly collaborations = toSignal(this.collaborationsService.findAllIndustrial().pipe(
    tap(() => {
      this.loading.set(true);
      this.error.set('');
    }),
    catchError(() => {
      this.error.set('Impossible de charger les partenariats industriels.');
      return of<CollaborationDTO[]>([]);
    }),
    tap(() => this.loading.set(false))
  ), { initialValue: [] });

  protected readonly hasData = computed(() => this.collaborations().length > 0);

  protected readonly sections = computed<CollaborationSection[]>(() => {
    const byScope = new Map<string, CollaborationDTO[]>();

    for (const collaboration of this.collaborations()) {
      const key = collaboration.scope === 'INTERNATIONAL'
        ? 'International'
        : collaboration.scope === 'REGIONAL'
          ? 'Régional'
          : 'National';
      const current = byScope.get(key) ?? [];
      current.push(collaboration);
      byScope.set(key, current);
    }

    return Array.from(byScope.entries()).map(([title, items]) => ({ title, items }));
  });

  protected labsForSection(section: CollaborationSection): string[] {
    return Array.from(new Set(section.items.map((item) => String(item.labAcronym ?? '').trim()).filter(Boolean))).slice(0, 2);
  }

  protected selectedLab(sectionTitle: string): string | null {
    return this.selectedLabBySection()[sectionTitle] ?? null;
  }

  protected setSelectedLab(sectionTitle: string, labAcronym: string): void {
    this.selectedLabBySection.update((current) => ({ ...current, [sectionTitle]: labAcronym }));
  }

  protected visibleCollaborations(section: CollaborationSection): CollaborationDTO[] {
    const labs = this.labsForSection(section);
    if (labs.length === 0) {
      return section.items;
    }

    const selected = this.selectedLab(section.title) ?? labs[0];
    return section.items.filter((item) => String(item.labAcronym ?? '').trim() === selected);
  }

  protected trackByCollaboration(index: number, collaboration: CollaborationDTO): string {
    return String(collaboration.id ?? `${collaboration.organization}-${collaboration.nature}-${index}`);
  }
}
