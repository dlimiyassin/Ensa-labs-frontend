import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { CollaborationDTO } from '../../../core/models/api.models';
import { CollaborationsService } from '../../../core/services/collaborations.service';
import { FilesService } from '../../../core/services/files.service';
import { AdminCrudPage } from '../shared/admin-crud-page';
import { matchesSearch } from '../shared/admin-utils';
import { ImageUploadComponent } from '../shared/image-upload';
import {
  COLLABORATION_SCOPE_LABELS,
  COLLABORATION_SCOPE_OPTIONS,
  COLLABORATION_TYPE_LABELS,
  COLLABORATION_TYPE_OPTIONS
} from '../shared/labels';
import { AdminPageHeaderComponent } from '../shared/page-header';

@Component({
  selector: 'app-collaborations-admin',
  imports: [
    ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, SelectModule, TableModule, TagModule, TooltipModule,
    AdminPageHeaderComponent, ImageUploadComponent
  ],
  template: `
    <app-admin-page-header title="Collaborations" subtitle="Partenariats académiques et industriels des laboratoires."
      addLabel="Nouvelle collaboration" [search]="search()" (searchChange)="search.set($event)" (add)="openCreate()" />

    <section class="admin-panel admin-panel--flush">
      <p-table [value]="filtered()" [loading]="loading()" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 25, 50]"
               sortField="organization" [sortOrder]="1" dataKey="id">
        <ng-template #header>
          <tr>
            <th style="width: 4rem"></th>
            <th pSortableColumn="organization">Organisation <p-sortIcon field="organization" /></th>
            <th>Thème</th>
            <th pSortableColumn="type">Type <p-sortIcon field="type" /></th>
            <th pSortableColumn="scope">Portée <p-sortIcon field="scope" /></th>
            <th pSortableColumn="labAcronym">Labo <p-sortIcon field="labAcronym" /></th>
            <th style="width: 7rem"></th>
          </tr>
        </ng-template>
        <ng-template #body let-collaboration>
          <tr>
            <td>
              @if (files.imageUrl(collaboration.logo); as logo) {
                <img class="admin-thumb" [src]="logo" [alt]="collaboration.organization" />
              } @else {
                <span class="admin-thumb admin-thumb--placeholder"><i class="pi pi-building"></i></span>
              }
            </td>
            <td class="admin-cell-wrap">
              <strong>{{ collaboration.organization }}</strong>
              <div class="admin-muted">{{ collaboration.establishment }}</div>
            </td>
            <td class="admin-cell-wrap">{{ collaboration.theme || collaboration.nature || '—' }}</td>
            <td><p-tag [value]="typeLabels[collaboration.type]" [severity]="collaboration.type === 'INDUSTRIAL' ? 'warn' : 'info'" /></td>
            <td>{{ scopeLabels[collaboration.scope] }}</td>
            <td>{{ collaboration.labAcronym }}</td>
            <td class="admin-actions">
              @if (scope.canManageLab(collaboration.labAcronym)) {
                <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" pTooltip="Modifier" (onClick)="openEdit(collaboration)" />
                <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" pTooltip="Supprimer" (onClick)="remove(collaboration)" />
              }
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr><td colspan="7" class="admin-empty">Aucune collaboration.</td></tr>
        </ng-template>
      </p-table>
    </section>

    <p-dialog [header]="editingId() ? 'Modifier la collaboration' : 'Nouvelle collaboration'" [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
              [modal]="true" [style]="{ width: '44rem' }" [breakpoints]="{ '768px': '95vw' }" [draggable]="false">
      <form class="admin-form" [formGroup]="form" (ngSubmit)="save()" id="collaboration-form">
        <app-image-upload folder="collaborations" [path]="form.controls.logo.value" (pathChange)="form.controls.logo.setValue($event ?? null)" />
        <div class="admin-form__grid">
          <label class="admin-field"><span>Organisation *</span><input pInputText formControlName="organization" /></label>
          <label class="admin-field"><span>Établissement</span><input pInputText formControlName="establishment" /></label>
          <label class="admin-field"><span>Thème</span><input pInputText formControlName="theme" /></label>
          <label class="admin-field"><span>Nature</span><input pInputText formControlName="nature" placeholder="Convention, projet, co-encadrement..." /></label>
          <label class="admin-field"><span>Type *</span>
            <p-select formControlName="type" [options]="typeOptions" optionLabel="label" optionValue="value" appendTo="body" />
          </label>
          <label class="admin-field"><span>Portée *</span>
            <p-select formControlName="scope" [options]="scopeOptions" optionLabel="label" optionValue="value" appendTo="body" />
          </label>
          <label class="admin-field"><span>Laboratoire *</span>
            <p-select formControlName="labAcronym" [options]="scope.writableLabOptions()" optionLabel="value" optionValue="value" appendTo="body" />
          </label>
        </div>
      </form>
      <ng-template #footer>
        <p-button label="Annuler" severity="secondary" [outlined]="true" (onClick)="closeDialog()" />
        <p-button label="Enregistrer" icon="pi pi-check" (onClick)="save()" [loading]="saving()" [disabled]="form.invalid" />
      </ng-template>
    </p-dialog>
  `
})
export class CollaborationsAdmin extends AdminCrudPage<CollaborationDTO> {
  private readonly collaborationsService = inject(CollaborationsService);
  protected readonly files = inject(FilesService);
  private readonly fb = inject(FormBuilder);

  protected readonly typeOptions = COLLABORATION_TYPE_OPTIONS;
  protected readonly scopeOptions = COLLABORATION_SCOPE_OPTIONS;
  protected readonly typeLabels: Record<string, string> = COLLABORATION_TYPE_LABELS;
  protected readonly scopeLabels: Record<string, string> = COLLABORATION_SCOPE_LABELS;

  protected readonly form = this.fb.group({
    organization: ['', Validators.required],
    establishment: [''],
    theme: [''],
    nature: [''],
    type: ['ACADEMIC', Validators.required],
    scope: ['NATIONAL', Validators.required],
    labAcronym: ['', Validators.required],
    logo: [null as string | null]
  });

  protected fetch(lab: string | null) {
    return lab ? this.collaborationsService.findByLabAcronym(lab) : this.collaborationsService.findAll();
  }

  protected matches(collaboration: CollaborationDTO, term: string): boolean {
    return matchesSearch(term, collaboration.organization, collaboration.establishment, collaboration.theme, collaboration.nature,
      collaboration.labAcronym);
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ type: 'ACADEMIC', scope: 'NATIONAL', labAcronym: this.scope.defaultLab() ?? '', logo: null });
    this.dialogVisible.set(true);
  }

  protected openEdit(collaboration: CollaborationDTO): void {
    this.editingId.set(collaboration.id ?? null);
    this.form.reset({
      organization: collaboration.organization ?? '',
      establishment: collaboration.establishment ?? '',
      theme: collaboration.theme ?? '',
      nature: collaboration.nature ?? '',
      type: collaboration.type ?? 'ACADEMIC',
      scope: collaboration.scope ?? 'NATIONAL',
      labAcronym: collaboration.labAcronym ?? '',
      logo: collaboration.logo ?? null
    });
    this.dialogVisible.set(true);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload: CollaborationDTO = {
      organization: value.organization?.trim(),
      establishment: value.establishment?.trim() || undefined,
      theme: value.theme?.trim() || undefined,
      nature: value.nature?.trim() || undefined,
      type: value.type as CollaborationDTO['type'],
      scope: value.scope as CollaborationDTO['scope'],
      labAcronym: value.labAcronym ?? undefined,
      logo: value.logo
    };
    const id = this.editingId();
    this.persist(id ? this.collaborationsService.update(id, payload) : this.collaborationsService.create(payload),
      id ? 'Collaboration mise à jour' : 'Collaboration ajoutée');
  }

  protected remove(collaboration: CollaborationDTO): void {
    this.askDelete(collaboration.organization ?? 'cette collaboration', () => this.collaborationsService.delete(collaboration.id as string));
  }
}
