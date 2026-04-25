import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';

import { PageHeroComponent } from '../../../shared/components/page-hero/page-hero';
import { LabsService } from '../../../core/services/labs.service';
import { ProductionsService } from '../../../core/services/productions.service';
import { LabDTO, ProductionDTO, PublicationDTO, ThesisDTO } from '../../../core/models/api.models';
import { TabsComponent, TabItem } from '../../../shared/components/public/tabs/tabs';
import { FilterBarComponent, FilterField } from '../../../shared/components/public/filter-bar/filter-bar';
import { EmptyStateComponent } from '../../../shared/components/public/empty-state/empty-state';
import { SectionTitleComponent } from '../../../shared/components/public/section-title/section-title';
import { SpinnerComponent } from '../../../shared/components/public/spinner/spinner';

interface GroupedEntry<T> {
  readonly year: string;
  readonly entries: readonly T[];
}

type ProductionTab = 'publications' | 'communications' | 'theses';

@Component({
  selector: 'app-productions',
  imports: [PageHeroComponent, TabsComponent, FilterBarComponent, EmptyStateComponent, SectionTitleComponent, SpinnerComponent],
  templateUrl: './productions.html',
  styleUrl: './productions.css',
})
export class Productions {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly labsService = inject(LabsService);
  private readonly productionsService = inject(ProductionsService);

  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly activeTab = signal<ProductionTab>('publications');
  protected readonly filters = signal<Record<string, string>>({ year: '', type: '', author: '', venue: '', supervisor: '' });

  protected readonly tabs: readonly TabItem[] = [
    { id: 'publications', label: 'Publications' },
    { id: 'communications', label: 'Communications' },
    { id: 'theses', label: 'Thèses' }
  ];

  protected readonly labs = toSignal(this.labsService.findAll().pipe(catchError(() => of<LabDTO[]>([]))), { initialValue: [] });

  protected readonly labCode = toSignal(this.route.paramMap.pipe(
    map((params) => (params.get('code') ?? 'LaRESI').trim()),
    distinctUntilChanged()
  ), { initialValue: 'LaRESI' });

  protected readonly production = toSignal(this.route.paramMap.pipe(
    map((params) => (params.get('code') ?? 'LaRESI').trim()),
    distinctUntilChanged(),
    tap(() => {
      this.loading.set(true);
      this.error.set('');
    }),
    switchMap((code) => this.productionsService.findByLabAcronym(code).pipe(
      catchError(() => {
        this.error.set('Impossible de charger les productions.');
        return of<ProductionDTO | null>(null);
      })
    )),
    tap(() => this.loading.set(false))
  ), { initialValue: null });

  protected readonly filterFields = computed<readonly FilterField[]>(() => {
    if (this.activeTab() === 'theses') {
      return [
        { key: 'year', label: 'Année', options: this.yearOptionsTheses() },
        { key: 'supervisor', label: 'Encadrant', options: this.supervisorOptions() }
      ];
    }

    return [
      { key: 'year', label: 'Année', options: this.yearOptionsPublications() },
      { key: 'type', label: 'Type', options: this.typeOptions() },
      { key: 'author', label: 'Auteur', options: this.authorOptions() },
      { key: 'venue', label: 'Journal/Conférence', options: this.venueOptions() }
    ];
  });

  protected readonly groupedPublications = computed(() => this.groupPublications(this.filterPublications(this.production()?.publications ?? [])));
  protected readonly groupedCommunications = computed(() => this.groupPublications(this.filterPublications(this.production()?.communications ?? [])));
  protected readonly groupedTheses = computed(() => this.groupTheses(this.filterTheses(this.production()?.theses ?? [])));

  protected selectLab(code: string): void {
    this.router.navigate(['/production', code]);
  }

  protected selectTab(tabId: string): void {
    this.activeTab.set(tabId as ProductionTab);
    this.filters.set({ year: '', type: '', author: '', venue: '', supervisor: '' });
  }

  protected updateFilter(event: { key: string; value: string }): void {
    this.filters.update((current) => ({ ...current, [event.key]: event.value }));
  }

  protected publicationLine(item: PublicationDTO): string {
    const authors = (item.authors ?? []).join(', ');
    const venue = item.journal || item.conference || '';
    return `${authors} — ${item.title ?? 'Sans titre'}${venue ? ` (${venue})` : ''}`;
  }

  protected thesisLine(item: ThesisDTO): string {
    const defenseYear = item.defenseDate ? new Date(item.defenseDate).getFullYear().toString() : '';
    return `${item.author ?? 'Auteur non précisé'} — ${item.title ?? 'Sans titre'}${defenseYear ? ` (${defenseYear})` : ''}`;
  }

  private filterPublications(items: readonly PublicationDTO[]): PublicationDTO[] {
    const { year, type, author, venue } = this.filters();
    return items.filter((item) => {
      const yearOk = !year || String(item.publicationYear ?? '') === year;
      const typeOk = !type || item.type === type;
      const authorOk = !author || (item.authors ?? []).includes(author);
      const venueValue = item.journal || item.conference || '';
      const venueOk = !venue || venueValue === venue;
      return yearOk && typeOk && authorOk && venueOk;
    });
  }

  private filterTheses(items: readonly ThesisDTO[]): ThesisDTO[] {
    const { year, supervisor } = this.filters();
    return items.filter((item) => {
      const itemYear = item.defenseDate ? new Date(item.defenseDate).getFullYear().toString() : '';
      const yearOk = !year || itemYear === year;
      const supervisorOk = !supervisor || (item.supervisor ?? '') === supervisor;
      return yearOk && supervisorOk;
    });
  }

  private groupPublications(items: readonly PublicationDTO[]): GroupedEntry<PublicationDTO>[] {
    const byYear = new Map<string, PublicationDTO[]>();
    for (const item of items) {
      const year = String(item.publicationYear ?? 'Sans année');
      byYear.set(year, [...(byYear.get(year) ?? []), item]);
    }

    return Array.from(byYear.entries())
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, entries]) => ({ year, entries }));
  }

  private groupTheses(items: readonly ThesisDTO[]): GroupedEntry<ThesisDTO>[] {
    const byYear = new Map<string, ThesisDTO[]>();
    for (const item of items) {
      const year = item.defenseDate ? String(new Date(item.defenseDate).getFullYear()) : 'Sans année';
      byYear.set(year, [...(byYear.get(year) ?? []), item]);
    }

    return Array.from(byYear.entries())
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, entries]) => ({ year, entries }));
  }

  private yearOptionsPublications(): string[] {
    const activeList = this.activeTab() === 'communications' ? this.production()?.communications ?? [] : this.production()?.publications ?? [];
    return [...new Set(activeList.map((item) => String(item.publicationYear ?? '')).filter(Boolean))].sort((a, b) => Number(b) - Number(a));
  }

  private typeOptions(): string[] {
    const activeList = this.activeTab() === 'communications' ? this.production()?.communications ?? [] : this.production()?.publications ?? [];
    return [...new Set(activeList.map((item) => item.type ?? '').filter(Boolean))];
  }

  private authorOptions(): string[] {
    const activeList = this.activeTab() === 'communications' ? this.production()?.communications ?? [] : this.production()?.publications ?? [];
    return [...new Set(activeList.flatMap((item) => item.authors ?? []).filter(Boolean))];
  }

  private venueOptions(): string[] {
    const activeList = this.activeTab() === 'communications' ? this.production()?.communications ?? [] : this.production()?.publications ?? [];
    return [...new Set(activeList.map((item) => item.journal || item.conference || '').filter(Boolean))];
  }

  private yearOptionsTheses(): string[] {
    const theses = this.production()?.theses ?? [];
    return [...new Set(theses.map((item) => item.defenseDate ? String(new Date(item.defenseDate).getFullYear()) : '').filter(Boolean))]
      .sort((a, b) => Number(b) - Number(a));
  }

  private supervisorOptions(): string[] {
    const theses = this.production()?.theses ?? [];
    return [...new Set(theses.map((item) => item.supervisor ?? '').filter(Boolean))];
  }
}
