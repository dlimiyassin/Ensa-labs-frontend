import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { EquipeDTO, MemberDTO } from '../../../core/models/api.models';
import { EquipesService } from '../../../core/services/equipes.service';
import { MembersService } from '../../../core/services/members.service';
import { AdminCrudPage } from '../shared/admin-crud-page';
import { matchesSearch, memberName } from '../shared/admin-utils';
import { AdminPageHeaderComponent } from '../shared/page-header';

@Component({
  selector: 'app-equipes-admin',
  imports: [
    ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, MultiSelectModule, SelectModule, TableModule, TooltipModule,
    AdminPageHeaderComponent
  ],
  template: `
    <app-admin-page-header title="Équipes" subtitle="Équipes de recherche, responsables et membres. Les axes se gèrent dans Ressources."
      addLabel="Nouvelle équipe" [search]="search()" (searchChange)="search.set($event)" (add)="openCreate()" />

    <section class="admin-panel admin-panel--flush">
      <p-table [value]="filtered()" [loading]="loading()" [paginator]="true" [rows]="10" sortField="name" [sortOrder]="1" dataKey="id">
        <ng-template #header>
          <tr>
            <th pSortableColumn="name">Équipe <p-sortIcon field="name" /></th>
            <th>Responsable</th>
            <th>Membres</th>
            <th>Axes</th>
            <th pSortableColumn="labAcronym">Labo <p-sortIcon field="labAcronym" /></th>
            <th style="width: 7rem"></th>
          </tr>
        </ng-template>
        <ng-template #body let-equipe>
          <tr>
            <td class="admin-cell-wrap"><strong>{{ equipe.name }}</strong></td>
            <td>{{ name(equipe.responsable) || '—' }}</td>
            <td>{{ (equipe.members || []).length }}</td>
            <td>{{ (equipe.axesRecherche || []).length }}</td>
            <td>{{ equipe.labAcronym }}</td>
            <td class="admin-actions">
              @if (scope.canManageLab(equipe.labAcronym)) {
                <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" pTooltip="Modifier" (onClick)="openEdit(equipe)" />
                <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" pTooltip="Supprimer" (onClick)="remove(equipe)" />
              }
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr><td colspan="6" class="admin-empty">Aucune équipe.</td></tr>
        </ng-template>
      </p-table>
    </section>

    <p-dialog [header]="editingId() ? 'Modifier l\\'équipe' : 'Nouvelle équipe'" [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
              [modal]="true" [style]="{ width: '40rem' }" [breakpoints]="{ '768px': '95vw' }" [draggable]="false">
      <form class="admin-form" [formGroup]="form" (ngSubmit)="save()" id="equipe-form">
        <label class="admin-field"><span>Nom de l'équipe *</span><input pInputText formControlName="name" /></label>
        <label class="admin-field"><span>Laboratoire *</span>
          <p-select formControlName="labAcronym" [options]="scope.writableLabOptions()" optionLabel="value" optionValue="value" appendTo="body" />
        </label>
        <label class="admin-field"><span>Responsable</span>
          <p-select formControlName="responsableId" [options]="memberOptions()" optionLabel="label" optionValue="value" [filter]="true"
                    [showClear]="true" placeholder="Aucun" appendTo="body" />
        </label>
        <label class="admin-field"><span>Membres</span>
          <p-multiselect formControlName="memberIds" [options]="memberOptions()" optionLabel="label" optionValue="value" [filter]="true"
                         display="chip" [maxSelectedLabels]="100" selectedItemsLabel="{0} éléments" placeholder="Sélectionner des membres" appendTo="body" styleClass="w-full" />
        </label>
        <small class="admin-muted">Le responsable est automatiquement ajouté aux membres. Il obtient le rôle « Chef d'équipe » si un super administrateur l'attribue à son compte.</small>
      </form>
      <ng-template #footer>
        <p-button label="Annuler" severity="secondary" [outlined]="true" (onClick)="closeDialog()" />
        <p-button label="Enregistrer" icon="pi pi-check" (onClick)="save()" [loading]="saving()" [disabled]="form.invalid" />
      </ng-template>
    </p-dialog>
  `
})
export class EquipesAdmin extends AdminCrudPage<EquipeDTO> {
  private readonly equipesService = inject(EquipesService);
  private readonly membersService = inject(MembersService);
  private readonly fb = inject(FormBuilder);

  protected readonly name = memberName;
  private readonly members = toSignal(this.membersService.findAll().pipe(catchError(() => of<MemberDTO[]>([]))), { initialValue: [] });
  private readonly formLab = signal<string | null>(null);
  private current: EquipeDTO | null = null;

  protected readonly memberOptions = computed(() => this.members()
    .filter((member) => member.labAcronym === this.formLab())
    .map((member) => ({ value: member.id as string, label: memberName(member) }))
    .sort((a, b) => a.label.localeCompare(b.label)));

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    labAcronym: ['', Validators.required],
    responsableId: [null as string | null],
    memberIds: [[] as string[]]
  });

  constructor() {
    super();
    this.form.controls.labAcronym.valueChanges.subscribe((lab) => {
      if (lab !== this.formLab()) {
        this.formLab.set(lab || null);
        if (this.dialogVisible()) {
          this.form.patchValue({ responsableId: null, memberIds: [] }, { emitEvent: false });
        }
      }
    });
  }

  protected fetch(lab: string | null) {
    return lab ? this.equipesService.findByLabAcronym(lab) : this.equipesService.findAll();
  }

  protected matches(equipe: EquipeDTO, term: string): boolean {
    return matchesSearch(term, equipe.name, equipe.labAcronym, memberName(equipe.responsable));
  }

  protected openCreate(): void {
    this.current = null;
    this.editingId.set(null);
    const lab = this.scope.defaultLab() ?? '';
    this.formLab.set(lab);
    this.form.reset({ name: '', labAcronym: lab, responsableId: null, memberIds: [] }, { emitEvent: false });
    this.dialogVisible.set(true);
  }

  protected openEdit(equipe: EquipeDTO): void {
    this.current = equipe;
    this.editingId.set(equipe.id ?? null);
    this.formLab.set(equipe.labAcronym ?? null);
    this.form.reset({
      name: equipe.name ?? '',
      labAcronym: equipe.labAcronym ?? '',
      responsableId: equipe.responsable?.id ?? null,
      memberIds: (equipe.members ?? []).map((member) => member.id as string)
    }, { emitEvent: false });
    this.dialogVisible.set(true);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload: EquipeDTO = {
      name: value.name?.trim(),
      labAcronym: value.labAcronym ?? undefined,
      responsable: value.responsableId ? { id: value.responsableId } : null,
      members: (value.memberIds ?? []).map((id) => ({ id })),
      // keep the current axes: they are managed from the Resources page
      axesRecherche: (this.current?.axesRecherche ?? []).map((axe) => ({ id: axe.id }))
    };
    const id = this.editingId();
    this.persist(id ? this.equipesService.update(id, payload) : this.equipesService.create(payload),
      id ? 'Équipe mise à jour' : 'Équipe créée');
  }

  protected remove(equipe: EquipeDTO): void {
    this.askDelete(equipe.name ?? 'cette équipe', () => this.equipesService.delete(equipe.id as string));
  }
}
