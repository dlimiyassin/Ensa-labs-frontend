import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { EquipeDTO, PublicationDTO } from '../../../core/models/api.models';
import { EquipesService } from '../../../core/services/equipes.service';
import { PublicationsService } from '../../../core/services/publications.service';
import { AdminCrudPage } from '../shared/admin-crud-page';
import { matchesSearch, splitLines } from '../shared/admin-utils';
import { PUBLICATION_TYPE_LABELS, PUBLICATION_TYPE_OPTIONS } from '../shared/labels';
import { AdminPageHeaderComponent } from '../shared/page-header';

@Component({
  selector: 'app-publications-admin',
  imports: [
    ReactiveFormsModule, ButtonModule, DialogModule, InputNumberModule, InputTextModule, SelectModule, TableModule, TagModule,
    TextareaModule, TooltipModule, AdminPageHeaderComponent
  ],
  template: `
    <app-admin-page-header title="Publications" subtitle="Articles, conférences, ouvrages et communications. Ils alimentent la page publique Productions."
      addLabel="Nouvelle publication" [search]="search()" (searchChange)="search.set($event)" (add)="openCreate()" />

    <section class="admin-panel admin-panel--flush">
      <p-table [value]="filtered()" [loading]="loading()" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 25, 50]"
               sortField="publicationYear" [sortOrder]="-1" dataKey="id">
        <ng-template #header>
          <tr>
            <th pSortableColumn="title">Titre <p-sortIcon field="title" /></th>
            <th pSortableColumn="type">Type <p-sortIcon field="type" /></th>
            <th pSortableColumn="publicationYear">Année <p-sortIcon field="publicationYear" /></th>
            <th>Support</th>
            <th pSortableColumn="labAcronym">Labo <p-sortIcon field="labAcronym" /></th>
            <th style="width: 7rem"></th>
          </tr>
        </ng-template>
        <ng-template #body let-publication>
          <tr>
            <td class="admin-cell-wrap">
              <strong>{{ publication.title }}</strong>
              <div class="admin-muted">{{ (publication.authors || []).join(', ') }}</div>
            </td>
            <td><p-tag [value]="typeLabels[publication.type] || publication.type" [severity]="publication.type === 'COMMUNICATION' ? 'warn' : 'info'" /></td>
            <td>{{ publication.publicationYear || '—' }}</td>
            <td class="admin-cell-wrap">{{ publication.journal || publication.conference || '—' }}</td>
            <td>{{ publication.labAcronym }}</td>
            <td class="admin-actions">
              @if (scope.canEditPublication(publication)) {
                <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" pTooltip="Modifier" (onClick)="openEdit(publication)" />
              }
              @if (scope.canDeletePublication(publication)) {
                <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" pTooltip="Supprimer" (onClick)="remove(publication)" />
              }
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr><td colspan="6" class="admin-empty">Aucune publication.</td></tr>
        </ng-template>
      </p-table>
    </section>

    <p-dialog [header]="editingId() ? 'Modifier la publication' : 'Nouvelle publication'" [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
              [modal]="true" [style]="{ width: '48rem' }" [breakpoints]="{ '768px': '95vw' }" [draggable]="false">
      <form class="admin-form" [formGroup]="form" (ngSubmit)="save()" id="publication-form">
        <label class="admin-field"><span>Titre *</span><textarea pTextarea formControlName="title" rows="2"></textarea></label>
        <div class="admin-form__grid">
          <label class="admin-field"><span>Type *</span>
            <p-select formControlName="type" [options]="typeOptions" optionLabel="label" optionValue="value" appendTo="body" />
          </label>
          <label class="admin-field"><span>Année</span>
            <p-inputnumber formControlName="publicationYear" [useGrouping]="false" [min]="1900" [max]="2100" />
          </label>
          <label class="admin-field"><span>Laboratoire *</span>
            <p-select formControlName="labAcronym" [options]="scope.writableLabOptions()" optionLabel="value" optionValue="value" appendTo="body" />
          </label>
          <label class="admin-field"><span>Équipe {{ teamRequired() ? '*' : '' }}</span>
            <p-select formControlName="equipeId" [options]="teamOptions()" optionLabel="label" optionValue="value" [showClear]="!teamRequired()"
                      placeholder="Aucune" appendTo="body" />
          </label>
          <label class="admin-field"><span>Revue</span><input pInputText formControlName="journal" /></label>
          <label class="admin-field"><span>Conférence</span><input pInputText formControlName="conference" /></label>
          <label class="admin-field"><span>DOI</span><input pInputText formControlName="doi" placeholder="10.xxxx/..." /></label>
          <label class="admin-field"><span>Pages</span><input pInputText formControlName="pages" /></label>
        </div>
        <label class="admin-field"><span>Auteurs <small>(un par ligne, dans l'ordre)</small></span>
          <textarea pTextarea formControlName="authors" rows="3"></textarea>
        </label>
      </form>
      <ng-template #footer>
        <p-button label="Annuler" severity="secondary" [outlined]="true" (onClick)="closeDialog()" />
        <p-button label="Enregistrer" icon="pi pi-check" (onClick)="save()" [loading]="saving()" [disabled]="form.invalid" />
      </ng-template>
    </p-dialog>
  `
})
export class PublicationsAdmin extends AdminCrudPage<PublicationDTO> {
  private readonly publicationsService = inject(PublicationsService);
  private readonly equipesService = inject(EquipesService);
  private readonly fb = inject(FormBuilder);

  protected readonly typeOptions = PUBLICATION_TYPE_OPTIONS;
  protected readonly typeLabels: Record<string, string> = PUBLICATION_TYPE_LABELS;

  private readonly equipes = toSignal(this.equipesService.findAll().pipe(catchError(() => of<EquipeDTO[]>([]))), { initialValue: [] });
  private readonly formLab = signal<string | null>(null);
  private current: PublicationDTO | null = null;

  /** A team leader who is not lab director publishes for one of his teams. */
  protected readonly teamRequired = computed(() => !this.auth.isSuperAdmin() && !this.auth.isLabDirector()
    && this.auth.isTeamLeader() && !this.auth.roles().includes('ROLE_RESEARCHER'));

  protected readonly teamOptions = computed(() => {
    const lab = this.formLab();
    const led = this.auth.currentUser()?.ledEquipeIds ?? [];
    return this.equipes()
      .filter((team) => team.labAcronym === lab)
      .filter((team) => !this.teamRequired() || led.includes(team.id ?? ''))
      .map((team) => ({ value: team.id as string, label: team.name ?? '' }));
  });

  protected readonly form = this.fb.group({
    title: ['', Validators.required],
    type: ['JOURNAL', Validators.required],
    publicationYear: [new Date().getFullYear() as number | null],
    labAcronym: ['', Validators.required],
    equipeId: [null as string | null],
    journal: [''],
    conference: [''],
    doi: [''],
    pages: [''],
    authors: ['']
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
    return lab ? this.publicationsService.findByLabAcronym(lab) : this.publicationsService.findAll();
  }

  protected matches(publication: PublicationDTO, term: string): boolean {
    return matchesSearch(term, publication.title, publication.journal, publication.conference, publication.publicationYear,
      publication.labAcronym, ...(publication.authors ?? []));
  }

  protected openCreate(): void {
    this.current = null;
    this.editingId.set(null);
    const lab = this.scope.defaultLab() ?? '';
    this.formLab.set(lab);
    this.form.reset({ type: 'JOURNAL', publicationYear: new Date().getFullYear(), labAcronym: lab, equipeId: null });
    if (this.teamRequired() && this.teamOptions().length > 0) {
      this.form.controls.equipeId.setValue(this.teamOptions()[0].value);
    }
    this.dialogVisible.set(true);
  }

  protected openEdit(publication: PublicationDTO): void {
    this.current = publication;
    this.editingId.set(publication.id ?? null);
    this.formLab.set(publication.labAcronym ?? null);
    this.form.reset({
      title: publication.title ?? '',
      type: publication.type ?? 'JOURNAL',
      publicationYear: publication.publicationYear ?? null,
      labAcronym: publication.labAcronym ?? '',
      equipeId: publication.equipeId ?? null,
      journal: publication.journal ?? '',
      conference: publication.conference ?? '',
      doi: publication.doi ?? '',
      pages: publication.pages ?? '',
      authors: (publication.authors ?? []).join('\n')
    });
    this.dialogVisible.set(true);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload: PublicationDTO = {
      ...this.current,
      title: value.title?.trim(),
      type: value.type as PublicationDTO['type'],
      publicationYear: value.publicationYear ?? undefined,
      labAcronym: value.labAcronym ?? undefined,
      equipeId: value.equipeId || null,
      journal: value.journal?.trim() || undefined,
      conference: value.conference?.trim() || undefined,
      doi: value.doi?.trim() || undefined,
      pages: value.pages?.trim() || undefined,
      authors: splitLines(value.authors)
    };
    const id = this.editingId();
    this.persist(id ? this.publicationsService.update(id, payload) : this.publicationsService.create(payload),
      id ? 'Publication mise à jour' : 'Publication ajoutée');
  }

  protected remove(publication: PublicationDTO): void {
    this.askDelete(publication.title ?? 'cette publication', () => this.publicationsService.delete(publication.id as string));
  }
}
