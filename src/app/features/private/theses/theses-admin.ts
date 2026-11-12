import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { ThesisDTO } from '../../../core/models/api.models';
import { ThesesService } from '../../../core/services/theses.service';
import { AdminCrudPage } from '../shared/admin-crud-page';
import { matchesSearch, parseIsoDate, toIsoDate } from '../shared/admin-utils';
import { AdminPageHeaderComponent } from '../shared/page-header';

@Component({
  selector: 'app-theses-admin',
  imports: [
    ReactiveFormsModule, DatePipe, ButtonModule, DatePickerModule, DialogModule, InputTextModule, SelectModule, TableModule,
    TextareaModule, TooltipModule, AdminPageHeaderComponent
  ],
  template: `
    <app-admin-page-header title="Thèses" subtitle="Thèses soutenues au sein des laboratoires."
      addLabel="Nouvelle thèse" [search]="search()" (searchChange)="search.set($event)" (add)="openCreate()" />

    <section class="admin-panel admin-panel--flush">
      <p-table [value]="filtered()" [loading]="loading()" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 25, 50]"
               sortField="defenseDate" [sortOrder]="-1" dataKey="id">
        <ng-template #header>
          <tr>
            <th pSortableColumn="title">Titre <p-sortIcon field="title" /></th>
            <th pSortableColumn="author">Doctorant <p-sortIcon field="author" /></th>
            <th>Encadrant</th>
            <th pSortableColumn="defenseDate">Soutenance <p-sortIcon field="defenseDate" /></th>
            <th pSortableColumn="labAcronym">Labo <p-sortIcon field="labAcronym" /></th>
            <th style="width: 7rem"></th>
          </tr>
        </ng-template>
        <ng-template #body let-thesis>
          <tr>
            <td class="admin-cell-wrap"><strong>{{ thesis.title }}</strong></td>
            <td>{{ thesis.author }}</td>
            <td>{{ thesis.supervisor || '—' }}</td>
            <td>{{ thesis.defenseDate ? (thesis.defenseDate | date: 'dd/MM/yyyy') : '—' }}</td>
            <td>{{ thesis.labAcronym }}</td>
            <td class="admin-actions">
              @if (scope.canEditProduction(thesis.labAcronym)) {
                <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" pTooltip="Modifier" (onClick)="openEdit(thesis)" />
              }
              @if (scope.canManageLab(thesis.labAcronym)) {
                <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" pTooltip="Supprimer" (onClick)="remove(thesis)" />
              }
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr><td colspan="6" class="admin-empty">Aucune thèse.</td></tr>
        </ng-template>
      </p-table>
    </section>

    <p-dialog [header]="editingId() ? 'Modifier la thèse' : 'Nouvelle thèse'" [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
              [modal]="true" [style]="{ width: '42rem' }" [breakpoints]="{ '768px': '95vw' }" [draggable]="false">
      <form class="admin-form" [formGroup]="form" (ngSubmit)="save()" id="thesis-form">
        <label class="admin-field"><span>Titre *</span><textarea pTextarea formControlName="title" rows="2"></textarea></label>
        <div class="admin-form__grid">
          <label class="admin-field"><span>Doctorant *</span><input pInputText formControlName="author" /></label>
          <label class="admin-field"><span>Encadrant</span><input pInputText formControlName="supervisor" /></label>
          <label class="admin-field"><span>Date de soutenance</span>
            <p-datepicker formControlName="defenseDate" dateFormat="dd/mm/yy" [showIcon]="true" [showButtonBar]="true" appendTo="body" />
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
export class ThesesAdmin extends AdminCrudPage<ThesisDTO> {
  private readonly thesesService = inject(ThesesService);
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    supervisor: [''],
    defenseDate: [null as Date | null],
    labAcronym: ['', Validators.required]
  });

  protected fetch(lab: string | null) {
    return lab ? this.thesesService.findByLabAcronym(lab) : this.thesesService.findAll();
  }

  protected matches(thesis: ThesisDTO, term: string): boolean {
    return matchesSearch(term, thesis.title, thesis.author, thesis.supervisor, thesis.labAcronym);
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ labAcronym: this.scope.defaultLab() ?? '', defenseDate: null });
    this.dialogVisible.set(true);
  }

  protected openEdit(thesis: ThesisDTO): void {
    this.editingId.set(thesis.id ?? null);
    this.form.reset({
      title: thesis.title ?? '',
      author: thesis.author ?? '',
      supervisor: thesis.supervisor ?? '',
      defenseDate: parseIsoDate(thesis.defenseDate),
      labAcronym: thesis.labAcronym ?? ''
    });
    this.dialogVisible.set(true);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload: ThesisDTO = {
      title: value.title?.trim(),
      author: value.author?.trim(),
      supervisor: value.supervisor?.trim() || undefined,
      defenseDate: toIsoDate(value.defenseDate),
      labAcronym: value.labAcronym ?? undefined
    };
    const id = this.editingId();
    this.persist(id ? this.thesesService.update(id, payload) : this.thesesService.create(payload),
      id ? 'Thèse mise à jour' : 'Thèse ajoutée');
  }

  protected remove(thesis: ThesisDTO): void {
    this.askDelete(thesis.title ?? 'cette thèse', () => this.thesesService.delete(thesis.id as string));
  }
}
