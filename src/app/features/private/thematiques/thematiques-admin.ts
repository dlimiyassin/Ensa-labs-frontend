import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ThematiqueRechercheDTO } from '../../../core/models/api.models';
import { ThematiquesService } from '../../../core/services/thematiques.service';
import { AdminCrudPage } from '../shared/admin-crud-page';
import { matchesSearch } from '../shared/admin-utils';
import { AdminPageHeaderComponent } from '../shared/page-header';

/** Global catalogue of research themes, shared by the labs (super admin). */
@Component({
  selector: 'app-thematiques-admin',
  imports: [ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, TableModule, TooltipModule, AdminPageHeaderComponent],
  template: `
    <app-admin-page-header title="Thématiques de recherche" subtitle="Catalogue commun ; chaque laboratoire choisit ses thématiques depuis sa fiche."
      addLabel="Nouvelle thématique" [showLabFilter]="false" [search]="search()" (searchChange)="search.set($event)" (add)="openCreate()" />

    <section class="admin-panel admin-panel--flush">
      <p-table [value]="filtered()" [loading]="loading()" [paginator]="true" [rows]="15" sortField="name" [sortOrder]="1" dataKey="id">
        <ng-template #header>
          <tr>
            <th pSortableColumn="name">Thématique <p-sortIcon field="name" /></th>
            <th style="width: 7rem"></th>
          </tr>
        </ng-template>
        <ng-template #body let-item>
          <tr>
            <td>{{ item.name }}</td>
            <td class="admin-actions">
              <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" pTooltip="Renommer" (onClick)="openEdit(item)" />
              <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" pTooltip="Supprimer" (onClick)="remove(item)" />
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage><tr><td colspan="2" class="admin-empty">Aucune thématique.</td></tr></ng-template>
      </p-table>
    </section>

    <p-dialog [header]="editingId() ? 'Renommer la thématique' : 'Nouvelle thématique'" [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
              [modal]="true" [style]="{ width: '32rem' }" [breakpoints]="{ '768px': '95vw' }" [draggable]="false">
      <form class="admin-form" [formGroup]="form" (ngSubmit)="save()" id="theme-form">
        <label class="admin-field"><span>Intitulé *</span><input pInputText formControlName="name" /></label>
      </form>
      <ng-template #footer>
        <p-button label="Annuler" severity="secondary" [outlined]="true" (onClick)="closeDialog()" />
        <p-button label="Enregistrer" icon="pi pi-check" (onClick)="save()" [loading]="saving()" [disabled]="form.invalid" />
      </ng-template>
    </p-dialog>
  `
})
export class ThematiquesAdmin extends AdminCrudPage<ThematiqueRechercheDTO> {
  private readonly service = inject(ThematiquesService);
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.group({ name: ['', Validators.required] });

  protected fetch() {
    return this.service.findAll();
  }

  protected matches(item: ThematiqueRechercheDTO, term: string): boolean {
    return matchesSearch(term, item.name);
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.form.reset({ name: '' });
    this.dialogVisible.set(true);
  }

  protected openEdit(item: ThematiqueRechercheDTO): void {
    this.editingId.set(item.id ?? null);
    this.form.reset({ name: item.name ?? '' });
    this.dialogVisible.set(true);
  }

  protected save(): void {
    if (this.form.invalid) return;
    const payload: ThematiqueRechercheDTO = { name: this.form.getRawValue().name?.trim() };
    const id = this.editingId();
    this.persist(id ? this.service.update(id, payload) : this.service.create(payload), id ? 'Thématique renommée' : 'Thématique ajoutée');
  }

  protected remove(item: ThematiqueRechercheDTO): void {
    this.askDelete(item.name ?? 'cette thématique', () => this.service.delete(item.id as string));
  }
}
