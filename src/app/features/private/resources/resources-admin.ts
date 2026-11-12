import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { AxeRechercheDTO, CompetenceDTO, EquipeDTO, EquipmentDTO } from '../../../core/models/api.models';
import { AxesRechercheService } from '../../../core/services/axes-recherche.service';
import { CompetencesService } from '../../../core/services/competences.service';
import { EquipesService } from '../../../core/services/equipes.service';
import { EquipmentsService } from '../../../core/services/equipments.service';
import { AdminCrudPage } from '../shared/admin-crud-page';
import { matchesSearch } from '../shared/admin-utils';
import {
  COMPETENCE_TYPE_LABELS,
  COMPETENCE_TYPE_OPTIONS,
  EQUIPMENT_CATEGORY_LABELS,
  EQUIPMENT_CATEGORY_OPTIONS
} from '../shared/labels';
import { AdminPageHeaderComponent } from '../shared/page-header';

const COMMON_IMPORTS = [
  ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, SelectModule, TableModule, TagModule, TextareaModule, TooltipModule
];

@Component({
  selector: 'app-competences-admin',
  imports: [...COMMON_IMPORTS],
  template: `
    <div class="admin-subheader">
      <p class="admin-muted">Expertises affichées sur la page publique « Compétences ».</p>
      <p-button icon="pi pi-plus" label="Nouvelle compétence" (onClick)="openCreate()" />
    </div>
    <p-table [value]="filtered()" [loading]="loading()" [paginator]="true" [rows]="10" sortField="type" dataKey="id">
      <ng-template #header>
        <tr>
          <th>Description</th>
          <th pSortableColumn="type">Type <p-sortIcon field="type" /></th>
          <th pSortableColumn="labAcronym">Labo <p-sortIcon field="labAcronym" /></th>
          <th style="width: 7rem"></th>
        </tr>
      </ng-template>
      <ng-template #body let-item>
        <tr>
          <td class="admin-cell-wrap">{{ item.description }}</td>
          <td><p-tag [value]="typeLabels[item.type]" severity="secondary" /></td>
          <td>{{ item.labAcronym }}</td>
          <td class="admin-actions">
            @if (scope.canManageLab(item.labAcronym)) {
              <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" pTooltip="Modifier" (onClick)="openEdit(item)" />
              <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" pTooltip="Supprimer" (onClick)="remove(item)" />
            }
          </td>
        </tr>
      </ng-template>
      <ng-template #emptymessage><tr><td colspan="4" class="admin-empty">Aucune compétence.</td></tr></ng-template>
    </p-table>

    <p-dialog [header]="editingId() ? 'Modifier la compétence' : 'Nouvelle compétence'" [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
              [modal]="true" [style]="{ width: '36rem' }" [breakpoints]="{ '768px': '95vw' }" [draggable]="false">
      <form class="admin-form" [formGroup]="form" (ngSubmit)="save()" id="competence-form">
        <label class="admin-field"><span>Description *</span><textarea pTextarea formControlName="description" rows="3"></textarea></label>
        <label class="admin-field"><span>Type *</span>
          <p-select formControlName="type" [options]="typeOptions" optionLabel="label" optionValue="value" appendTo="body" />
        </label>
        <label class="admin-field"><span>Laboratoire *</span>
          <p-select formControlName="labAcronym" [options]="scope.writableLabOptions()" optionLabel="value" optionValue="value" appendTo="body" />
        </label>
      </form>
      <ng-template #footer>
        <p-button label="Annuler" severity="secondary" [outlined]="true" (onClick)="closeDialog()" />
        <p-button label="Enregistrer" icon="pi pi-check" (onClick)="save()" [loading]="saving()" [disabled]="form.invalid" />
      </ng-template>
    </p-dialog>
  `
})
export class CompetencesAdmin extends AdminCrudPage<CompetenceDTO> {
  private readonly service = inject(CompetencesService);
  private readonly fb = inject(FormBuilder);
  protected readonly typeOptions = COMPETENCE_TYPE_OPTIONS;
  protected readonly typeLabels: Record<string, string> = COMPETENCE_TYPE_LABELS;
  /** Search box of the parent Resources page. */
  readonly searchTerm = input('');
  private readonly syncSearch = effect(() => this.search.set(this.searchTerm()));

  protected readonly form = this.fb.group({
    description: ['', Validators.required],
    type: ['SCIENTIFIC', Validators.required],
    labAcronym: ['', Validators.required]
  });

  protected fetch(lab: string | null) {
    return lab ? this.service.findByLabAcronym(lab) : this.service.findAll();
  }

  protected matches(item: CompetenceDTO, term: string): boolean {
    return matchesSearch(term, item.description, item.labAcronym, COMPETENCE_TYPE_LABELS[item.type ?? 'SCIENTIFIC']);
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ type: 'SCIENTIFIC', labAcronym: this.scope.defaultLab() ?? '' });
    this.dialogVisible.set(true);
  }

  protected openEdit(item: CompetenceDTO): void {
    this.editingId.set(item.id ?? null);
    this.form.reset({ description: item.description ?? '', type: item.type ?? 'SCIENTIFIC', labAcronym: item.labAcronym ?? '' });
    this.dialogVisible.set(true);
  }

  protected save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const payload: CompetenceDTO = {
      description: value.description?.trim(),
      type: value.type as CompetenceDTO['type'],
      labAcronym: value.labAcronym ?? undefined
    };
    const id = this.editingId();
    this.persist(id ? this.service.update(id, payload) : this.service.create(payload), id ? 'Compétence mise à jour' : 'Compétence ajoutée');
  }

  protected remove(item: CompetenceDTO): void {
    this.askDelete(item.description ?? 'cette compétence', () => this.service.delete(item.id as string));
  }
}

@Component({
  selector: 'app-equipments-admin',
  imports: [...COMMON_IMPORTS],
  template: `
    <div class="admin-subheader">
      <p class="admin-muted">Équipements affichés sur la page publique « Équipements ».</p>
      <p-button icon="pi pi-plus" label="Nouvel équipement" (onClick)="openCreate()" />
    </div>
    <p-table [value]="filtered()" [loading]="loading()" [paginator]="true" [rows]="10" sortField="category" dataKey="id">
      <ng-template #header>
        <tr>
          <th pSortableColumn="name">Équipement <p-sortIcon field="name" /></th>
          <th pSortableColumn="category">Catégorie <p-sortIcon field="category" /></th>
          <th pSortableColumn="labAcronym">Labo <p-sortIcon field="labAcronym" /></th>
          <th style="width: 7rem"></th>
        </tr>
      </ng-template>
      <ng-template #body let-item>
        <tr>
          <td class="admin-cell-wrap">{{ item.name }}</td>
          <td><p-tag [value]="categoryLabels[item.category]" severity="secondary" /></td>
          <td>{{ item.labAcronym }}</td>
          <td class="admin-actions">
            @if (scope.canManageLab(item.labAcronym)) {
              <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" pTooltip="Modifier" (onClick)="openEdit(item)" />
              <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" pTooltip="Supprimer" (onClick)="remove(item)" />
            }
          </td>
        </tr>
      </ng-template>
      <ng-template #emptymessage><tr><td colspan="4" class="admin-empty">Aucun équipement.</td></tr></ng-template>
    </p-table>

    <p-dialog [header]="editingId() ? 'Modifier l\\'équipement' : 'Nouvel équipement'" [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
              [modal]="true" [style]="{ width: '36rem' }" [breakpoints]="{ '768px': '95vw' }" [draggable]="false">
      <form class="admin-form" [formGroup]="form" (ngSubmit)="save()" id="equipment-form">
        <label class="admin-field"><span>Désignation *</span><input pInputText formControlName="name" /></label>
        <label class="admin-field"><span>Catégorie *</span>
          <p-select formControlName="category" [options]="categoryOptions" optionLabel="label" optionValue="value" appendTo="body" />
        </label>
        <label class="admin-field"><span>Laboratoire *</span>
          <p-select formControlName="labAcronym" [options]="scope.writableLabOptions()" optionLabel="value" optionValue="value" appendTo="body" />
        </label>
      </form>
      <ng-template #footer>
        <p-button label="Annuler" severity="secondary" [outlined]="true" (onClick)="closeDialog()" />
        <p-button label="Enregistrer" icon="pi pi-check" (onClick)="save()" [loading]="saving()" [disabled]="form.invalid" />
      </ng-template>
    </p-dialog>
  `
})
export class EquipmentsAdmin extends AdminCrudPage<EquipmentDTO> {
  private readonly service = inject(EquipmentsService);
  private readonly fb = inject(FormBuilder);
  protected readonly categoryOptions = EQUIPMENT_CATEGORY_OPTIONS;
  protected readonly categoryLabels: Record<string, string> = EQUIPMENT_CATEGORY_LABELS;
  /** Search box of the parent Resources page. */
  readonly searchTerm = input('');
  private readonly syncSearch = effect(() => this.search.set(this.searchTerm()));

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    category: ['LAB', Validators.required],
    labAcronym: ['', Validators.required]
  });

  protected fetch(lab: string | null) {
    return lab ? this.service.findByLabAcronym(lab) : this.service.findAll();
  }

  protected matches(item: EquipmentDTO, term: string): boolean {
    return matchesSearch(term, item.name, item.labAcronym, EQUIPMENT_CATEGORY_LABELS[item.category ?? 'LAB']);
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ category: 'LAB', labAcronym: this.scope.defaultLab() ?? '' });
    this.dialogVisible.set(true);
  }

  protected openEdit(item: EquipmentDTO): void {
    this.editingId.set(item.id ?? null);
    this.form.reset({ name: item.name ?? '', category: item.category ?? 'LAB', labAcronym: item.labAcronym ?? '' });
    this.dialogVisible.set(true);
  }

  protected save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const payload: EquipmentDTO = {
      name: value.name?.trim(),
      category: value.category as EquipmentDTO['category'],
      labAcronym: value.labAcronym ?? undefined
    };
    const id = this.editingId();
    this.persist(id ? this.service.update(id, payload) : this.service.create(payload), id ? 'Équipement mis à jour' : 'Équipement ajouté');
  }

  protected remove(item: EquipmentDTO): void {
    this.askDelete(item.name ?? 'cet équipement', () => this.service.delete(item.id as string));
  }
}

@Component({
  selector: 'app-axes-admin',
  imports: [...COMMON_IMPORTS],
  template: `
    <div class="admin-subheader">
      <p class="admin-muted">Un axe est rattaché soit au laboratoire, soit à l'une de ses équipes.</p>
      <p-button icon="pi pi-plus" label="Nouvel axe" (onClick)="openCreate()" />
    </div>
    <p-table [value]="filtered()" [loading]="loading()" [paginator]="true" [rows]="10" dataKey="id">
      <ng-template #header>
        <tr>
          <th>Axe de recherche</th>
          <th>Rattachement</th>
          <th>Labo</th>
          <th style="width: 7rem"></th>
        </tr>
      </ng-template>
      <ng-template #body let-item>
        <tr>
          <td class="admin-cell-wrap">{{ item.title }}</td>
          <td>{{ item.equipeId ? 'Équipe : ' + teamName(item.equipeId) : 'Laboratoire' }}</td>
          <td>{{ labOf(item) }}</td>
          <td class="admin-actions">
            @if (scope.canManageLab(labOf(item))) {
              <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" pTooltip="Modifier" (onClick)="openEdit(item)" />
              <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" pTooltip="Supprimer" (onClick)="remove(item)" />
            }
          </td>
        </tr>
      </ng-template>
      <ng-template #emptymessage><tr><td colspan="4" class="admin-empty">Aucun axe de recherche.</td></tr></ng-template>
    </p-table>

    <p-dialog [header]="editingId() ? 'Modifier l\\'axe' : 'Nouvel axe de recherche'" [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
              [modal]="true" [style]="{ width: '36rem' }" [breakpoints]="{ '768px': '95vw' }" [draggable]="false">
      <form class="admin-form" [formGroup]="form" (ngSubmit)="save()" id="axe-form">
        <label class="admin-field"><span>Intitulé *</span><textarea pTextarea formControlName="title" rows="2"></textarea></label>
        <label class="admin-field"><span>Laboratoire *</span>
          <p-select formControlName="labAcronym" [options]="scope.writableLabOptions()" optionLabel="value" optionValue="value" appendTo="body" />
        </label>
        <label class="admin-field"><span>Équipe</span>
          <p-select formControlName="equipeId" [options]="teamOptions()" optionLabel="label" optionValue="value" [showClear]="true"
                    placeholder="Axe du laboratoire" appendTo="body" />
        </label>
      </form>
      <ng-template #footer>
        <p-button label="Annuler" severity="secondary" [outlined]="true" (onClick)="closeDialog()" />
        <p-button label="Enregistrer" icon="pi pi-check" (onClick)="save()" [loading]="saving()" [disabled]="form.invalid" />
      </ng-template>
    </p-dialog>
  `
})
export class AxesAdmin extends AdminCrudPage<AxeRechercheDTO> {
  private readonly service = inject(AxesRechercheService);
  private readonly equipesService = inject(EquipesService);
  private readonly fb = inject(FormBuilder);
  /** Search box of the parent Resources page. */
  readonly searchTerm = input('');
  private readonly syncSearch = effect(() => this.search.set(this.searchTerm()));

  private readonly equipes = toSignal(this.equipesService.findAll().pipe(catchError(() => of<EquipeDTO[]>([]))), { initialValue: [] });
  private readonly formLab = signal<string | null>(null);
  protected readonly teamOptions = computed(() => this.equipes()
    .filter((team) => team.labAcronym === this.formLab())
    .map((team) => ({ value: team.id as string, label: team.name ?? '' })));

  protected readonly form = this.fb.group({
    title: ['', Validators.required],
    labAcronym: ['', Validators.required],
    equipeId: [null as string | null]
  });

  constructor() {
    super();
    this.form.controls.labAcronym.valueChanges.subscribe((lab) => {
      this.formLab.set(lab || null);
      const team = this.form.controls.equipeId.value;
      if (team && !this.teamOptions().some((option) => option.value === team)) {
        this.form.controls.equipeId.setValue(null);
      }
    });
  }

  protected fetch(lab: string | null) {
    return lab ? this.service.findByLabAcronym(lab) : this.service.findAll();
  }

  protected matches(item: AxeRechercheDTO, term: string): boolean {
    return matchesSearch(term, item.title, this.labOf(item), item.equipeId ? this.teamName(item.equipeId) : '');
  }

  protected teamName(equipeId: string): string {
    return this.equipes().find((team) => team.id === equipeId)?.name ?? '—';
  }

  protected labOf(item: AxeRechercheDTO): string {
    return item.labAcronym ?? this.equipes().find((team) => team.id === item.equipeId)?.labAcronym ?? '';
  }

  protected openCreate(): void {
    this.editingId.set(null);
    const lab = this.scope.defaultLab() ?? '';
    this.formLab.set(lab);
    this.form.reset({ title: '', labAcronym: lab, equipeId: null });
    this.dialogVisible.set(true);
  }

  protected openEdit(item: AxeRechercheDTO): void {
    this.editingId.set(item.id ?? null);
    const lab = this.labOf(item);
    this.formLab.set(lab);
    this.form.reset({ title: item.title ?? '', labAcronym: lab, equipeId: item.equipeId ?? null });
    this.dialogVisible.set(true);
  }

  protected save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const payload: AxeRechercheDTO = value.equipeId
      ? { title: value.title?.trim(), equipeId: value.equipeId, labAcronym: null }
      : { title: value.title?.trim(), labAcronym: value.labAcronym, equipeId: null };
    const id = this.editingId();
    this.persist(id ? this.service.update(id, payload) : this.service.create(payload), id ? 'Axe mis à jour' : 'Axe ajouté');
  }

  protected remove(item: AxeRechercheDTO): void {
    this.askDelete(item.title ?? 'cet axe', () => this.service.delete(item.id as string));
  }
}

@Component({
  selector: 'app-resources-admin',
  imports: [TabsModule, AdminPageHeaderComponent, CompetencesAdmin, EquipmentsAdmin, AxesAdmin],
  template: `
    <app-admin-page-header title="Ressources" subtitle="Compétences, équipements et axes de recherche des laboratoires."
      [search]="search()" (searchChange)="search.set($event)" />

    <section class="admin-panel">
      <p-tabs [value]="tab()" (valueChange)="tab.set($any($event))">
        <p-tablist>
          <p-tab value="competences"><i class="pi pi-star"></i> Compétences</p-tab>
          <p-tab value="equipments"><i class="pi pi-box"></i> Équipements</p-tab>
          <p-tab value="axes"><i class="pi pi-compass"></i> Axes de recherche</p-tab>
        </p-tablist>
        <p-tabpanels>
          <p-tabpanel value="competences">
            @if (tab() === 'competences') { <app-competences-admin [searchTerm]="search()" /> }
          </p-tabpanel>
          <p-tabpanel value="equipments">
            @if (tab() === 'equipments') { <app-equipments-admin [searchTerm]="search()" /> }
          </p-tabpanel>
          <p-tabpanel value="axes">
            @if (tab() === 'axes') { <app-axes-admin [searchTerm]="search()" /> }
          </p-tabpanel>
        </p-tabpanels>
      </p-tabs>
    </section>
  `
})
export class ResourcesAdmin {
  protected readonly tab = signal<'competences' | 'equipments' | 'axes'>('competences');
  protected readonly search = signal('');
}
