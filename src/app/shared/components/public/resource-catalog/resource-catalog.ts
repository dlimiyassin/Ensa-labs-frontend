import { Component, computed, input, signal } from '@angular/core';

export interface ResourceItem {
  readonly label: string;
  readonly lab?: string | null;
}

export interface ResourceGroup {
  readonly key: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly items: readonly ResourceItem[];
}

/**
 * Public catalogue of lab resources (equipment, competences): lab filter, search,
 * and one card per category listing its items with their lab.
 */
@Component({
  selector: 'app-resource-catalog',
  templateUrl: './resource-catalog.html',
  styleUrl: './resource-catalog.css'
})
export class ResourceCatalogComponent {
  readonly groups = input.required<readonly ResourceGroup[]>();
  readonly itemNoun = input('éléments');

  protected readonly selectedLab = signal<string | null>(null);
  protected readonly search = signal('');

  protected readonly labs = computed(() => Array.from(new Set(this.groups()
    .flatMap((group) => group.items.map((item) => item.lab ?? ''))
    .filter(Boolean))).sort());

  protected readonly visibleGroups = computed(() => {
    const lab = this.selectedLab();
    const term = normalize(this.search());
    return this.groups()
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => (!lab || item.lab === lab) && (!term || normalize(item.label).includes(term)))
      }))
      .filter((group) => group.items.length > 0);
  });

  protected readonly total = computed(() => this.visibleGroups().reduce((sum, group) => sum + group.items.length, 0));

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
