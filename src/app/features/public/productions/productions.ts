import { Component, computed, effect, inject, signal } from '@angular/core';
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

  private readonly routeTab = toSignal(this.route.paramMap.pipe(
    map((params) => this.normalizeTab(params.get('tab'))),
    distinctUntilChanged()
  ), { initialValue: 'publications' as ProductionTab });

  private readonly routeCode = toSignal(this.route.paramMap.pipe(
    map((params) => (params.get('code') ?? '').trim()),
    distinctUntilChanged()
  ), { initialValue: '' });

  protected readonly selectedLabCode = computed(() => this.resolveLabCode(this.routeCode()));

  protected readonly production = toSignal(this.route.paramMap.pipe(
    map((params) => ({
      tab: this.normalizeTab(params.get('tab')),
      code: (params.get('code') ?? '').trim()
    })),
    distinctUntilChanged((a, b) => a.tab === b.tab && a.code === b.code),
    tap(({ tab }) => {
      this.activeTab.set(tab);
      this.loading.set(true);
      this.error.set('');
    }),
    switchMap(({ code }) => {
      const selected = this.resolveLab(this.resolveLabCode(code));
      const acronym = (selected?.acronym ?? '').trim();

      if (!acronym) {
        this.loading.set(false);
        this.error.set('Aucun laboratoire disponible.');
        return of<ProductionDTO | null>(null);
      }

      return this.productionsService.findByLabAcronym(acronym).pipe(
        catchError(() => {
          this.error.set('Impossible de charger les productions.');
          return of<ProductionDTO | null>(null);
        }),
        tap(() => this.loading.set(false))
      );
    })
  ), { initialValue: null });

  constructor() {
    effect(() => {
      const tab = this.routeTab();
      const code = this.selectedLabCode();
      const routeCode = this.routeCode();
      if (!code) {
        return;
      }

      if (routeCode !== code) {
        this.router.navigate(['/production', tab, code], { replaceUrl: true });
      }
    });
  }

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
    this.router.navigate(['/production', this.activeTab(), code]);
  }

  protected selectTab(tabId: string): void {
    const tab = this.normalizeTab(tabId);
    this.filters.set({ year: '', type: '', author: '', venue: '', supervisor: '' });
    this.router.navigate(['/production', tab, this.selectedLabCode()]);
  }

  protected updateFilter(event: { key: string; value: string }): void {
    this.filters.update((current) => ({ ...current, [event.key]: event.value }));
  }

  protected getCode(lab: LabDTO): string {
    return (lab.code ?? lab.acronym ?? '').trim();
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

  private normalizeTab(tab: string | null): ProductionTab {
    if (tab === 'communications' || tab === 'theses' || tab === 'publications') {
      return tab;
    }

    return 'publications';
  }

  private resolveLabCode(rawCode: string): string {
    const allLabs = this.labs();
    if (allLabs.length === 0) {
      return 'LaRESI';
    }

    const normalized = rawCode.trim().toLowerCase();
    const selected = allLabs.find((lab) => {
      const code = (lab.code ?? '').trim().toLowerCase();
      const acronym = (lab.acronym ?? '').trim().toLowerCase();
      return normalized && (code === normalized || acronym === normalized);
    });

    if (selected) {
      return this.getCode(selected);
    }

    const laresi = allLabs.find((lab) => {
      const code = (lab.code ?? '').trim().toLowerCase();
      const acronym = (lab.acronym ?? '').trim().toLowerCase();
      return code === 'laresi' || acronym === 'laresi';
    });

    return this.getCode(laresi ?? allLabs[0]);
  }

  private resolveLab(code: string): LabDTO | undefined {
    const normalized = code.trim().toLowerCase();
    return this.labs().find((lab) => this.getCode(lab).toLowerCase() === normalized);
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
