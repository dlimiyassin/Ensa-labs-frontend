import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, map, of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { LabDTO, MemberDTO, ThematiqueRechercheDTO } from '../../../core/models/api.models';
import { LabsService } from '../../../core/services/labs.service';
import { MembersService } from '../../../core/services/members.service';
import { ThematiquesService } from '../../../core/services/thematiques.service';
import { AdminCrudPage } from '../shared/admin-crud-page';
import { matchesSearch, memberName, parseIsoDate, toIsoDate } from '../shared/admin-utils';
import { AdminPageHeaderComponent } from '../shared/page-header';

type CommitteeRow = FormGroup<{
  memberId: FormControl<string | null>;
  nomEnseignant: FormControl<string | null>;
  roleComite: FormControl<string | null>;
}>;

@Component({
  selector: 'app-labs-admin',
  imports: [
    ReactiveFormsModule, DatePipe, ButtonModule, DatePickerModule, DialogModule, InputTextModule, MultiSelectModule, SelectModule,
    TableModule, TooltipModule, AdminPageHeaderComponent
  ],
  template: `
    <app-admin-page-header title="Laboratoires" subtitle="Identité, accréditation, direction, comité de gestion et thématiques."
      [addLabel]="auth.isSuperAdmin() ? 'Nouveau laboratoire' : ''" [showLabFilter]="false"
      [search]="search()" (searchChange)="search.set($event)" (add)="openCreate()" />

    <section class="admin-panel admin-panel--flush">
      <p-table [value]="filtered()" [loading]="loading()" dataKey="id" sortField="acronym" [sortOrder]="1">
        <ng-template #header>
          <tr>
            <th pSortableColumn="acronym">Sigle <p-sortIcon field="acronym" /></th>
            <th>Intitulé</th>
            <th>Direction</th>
            <th>Accréditation</th>
            <th>Membres</th>
            <th style="width: 7rem"></th>
          </tr>
        </ng-template>
        <ng-template #body let-lab>
          <tr>
            <td><strong>{{ lab.acronym }}</strong></td>
            <td class="admin-cell-wrap">{{ lab.titleFr }}<div class="admin-muted">{{ lab.titleEn }}</div></td>
            <td>{{ name(lab.directeur) || '—' }}</td>
            <td>
              @if (lab.accreditationStart || lab.accreditationEnd) {
                {{ lab.accreditationStart | date: 'yyyy' }} – {{ lab.accreditationEnd | date: 'yyyy' }}
              } @else { — }
            </td>
            <td>{{ (lab.members || []).length }}</td>
            <td class="admin-actions">
              @if (scope.canManageLab(lab.acronym)) {
                <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" pTooltip="Modifier" (onClick)="openEdit(lab)" />
              }
              @if (auth.isSuperAdmin()) {
                <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" pTooltip="Supprimer (laboratoire vide uniquement)" (onClick)="remove(lab)" />
              }
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr><td colspan="6" class="admin-empty">Aucun laboratoire.</td></tr>
        </ng-template>
      </p-table>
    </section>

    <p-dialog [header]="editingId() ? 'Modifier le laboratoire' : 'Nouveau laboratoire'" [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
              [modal]="true" [style]="{ width: '56rem' }" [breakpoints]="{ '900px': '95vw' }" [draggable]="false" [maximizable]="true">
      <form class="admin-form" [formGroup]="form" (ngSubmit)="save()" id="lab-form">
        <h3 class="admin-form__section">Identité</h3>
        <div class="admin-form__grid">
          <label class="admin-field"><span>Sigle *</span><input pInputText formControlName="acronym" /></label>
          <label class="admin-field"><span>Université</span><input pInputText formControlName="university" /></label>
          <label class="admin-field admin-field--wide"><span>Intitulé (français) *</span><input pInputText formControlName="titleFr" /></label>
          <label class="admin-field admin-field--wide"><span>Intitulé (anglais) *</span><input pInputText formControlName="titleEn" /></label>
          <label class="admin-field"><span>Établissement</span><input pInputText formControlName="establishment" /></label>
          <label class="admin-field"><span>Programme</span><input pInputText formControlName="program" /></label>
          <label class="admin-field"><span>Téléphone</span><input pInputText formControlName="phone" /></label>
          <label class="admin-field"><span>E-mail</span><input pInputText type="email" formControlName="email" /></label>
        </div>

        <h3 class="admin-form__section">Accréditation</h3>
        <div class="admin-form__grid">
          <label class="admin-field"><span>Début</span>
            <p-datepicker formControlName="accreditationStart" dateFormat="dd/mm/yy" [showIcon]="true" [showButtonBar]="true" appendTo="body" />
          </label>
          <label class="admin-field"><span>Fin</span>
            <p-datepicker formControlName="accreditationEnd" dateFormat="dd/mm/yy" [showIcon]="true" [showButtonBar]="true" appendTo="body" />
          </label>
        </div>

        @if (editingId()) {
          <h3 class="admin-form__section">Direction</h3>
          <div class="admin-form__grid">
            <label class="admin-field"><span>Directeur</span>
              <p-select formControlName="directeurId" [options]="memberOptions()" optionLabel="label" optionValue="value" [filter]="true" [showClear]="true" placeholder="—" appendTo="body" />
            </label>
            <label class="admin-field"><span>Directeur adjoint</span>
              <p-select formControlName="directeurAdjointId" [options]="memberOptions()" optionLabel="label" optionValue="value" [filter]="true" [showClear]="true" placeholder="—" appendTo="body" />
            </label>
          </div>

          <h3 class="admin-form__section">
            Comité de gestion
            <p-button type="button" icon="pi pi-plus" label="Ajouter" size="small" [text]="true" (onClick)="addCommitteeRow()" />
          </h3>
          <div formArrayName="comiteGestion" class="admin-rows">
            @for (row of committee.controls; track row; let i = $index) {
              <div class="admin-row" [formGroupName]="i">
                <p-select formControlName="memberId" [options]="memberOptions()" optionLabel="label" optionValue="value" [filter]="true"
                          [showClear]="true" placeholder="Membre" appendTo="body" (onChange)="onCommitteeMember(row)" />
                <input pInputText formControlName="nomEnseignant" placeholder="Nom affiché" />
                <input pInputText formControlName="roleComite" placeholder="Rôle dans le comité" />
                <p-button type="button" icon="pi pi-trash" [text]="true" severity="danger" ariaLabel="Retirer" (onClick)="committee.removeAt(i)" />
              </div>
            } @empty {
              <p class="admin-muted">Aucun membre dans le comité.</p>
            }
          </div>
        } @else {
          <p class="admin-muted">La direction et le comité de gestion se renseignent après la création, une fois les membres ajoutés.</p>
        }

        <h3 class="admin-form__section">Thématiques de recherche</h3>
        <p-multiselect formControlName="thematiqueIds" [options]="thematiqueOptions()" optionLabel="label" optionValue="value" [filter]="true"
                       display="chip" [maxSelectedLabels]="100" selectedItemsLabel="{0} éléments" placeholder="Sélectionner des thématiques" appendTo="body" styleClass="w-full" />
        <div class="admin-inline">
          <input pInputText #newTheme placeholder="Nouvelle thématique" (keydown.enter)="$event.preventDefault(); addTheme(newTheme)" />
          <p-button type="button" icon="pi pi-plus" label="Ajouter" [outlined]="true" (onClick)="addTheme(newTheme)" />
        </div>
      </form>
      <ng-template #footer>
        <p-button label="Annuler" severity="secondary" [outlined]="true" (onClick)="closeDialog()" />
        <p-button label="Enregistrer" icon="pi pi-check" (onClick)="save()" [loading]="saving()" [disabled]="form.invalid" />
      </ng-template>
    </p-dialog>
  `
})
export class LabsAdmin extends AdminCrudPage<LabDTO> {
  private readonly labsService = inject(LabsService);
  private readonly membersService = inject(MembersService);
  private readonly thematiquesService = inject(ThematiquesService);
  private readonly fb = inject(FormBuilder);

  protected readonly name = memberName;
  private current: LabDTO | null = null;
  private readonly labMembers = signal<MemberDTO[]>([]);
  private readonly extraThemes = signal<ThematiqueRechercheDTO[]>([]);
  private readonly catalogue = toSignal(this.thematiquesService.findAll().pipe(catchError(() => of<ThematiqueRechercheDTO[]>([]))), { initialValue: [] });

  protected readonly memberOptions = computed(() => this.labMembers()
    .map((member) => ({ value: member.id as string, label: memberName(member) }))
    .sort((a, b) => a.label.localeCompare(b.label)));

  /** Catalogue themes plus the ones typed in the form (value = id, or "new:<name>"). */
  protected readonly thematiqueOptions = computed(() => [...this.catalogue(), ...this.extraThemes()]
    .map((theme) => ({ value: theme.id ?? `new:${theme.name}`, label: theme.name ?? '' }))
    .sort((a, b) => a.label.localeCompare(b.label)));

  protected readonly form = this.fb.group({
    acronym: ['', Validators.required],
    titleFr: ['', Validators.required],
    titleEn: ['', Validators.required],
    university: [''],
    establishment: [''],
    program: [''],
    phone: [''],
    email: ['', Validators.email],
    accreditationStart: [null as Date | null],
    accreditationEnd: [null as Date | null],
    directeurId: [null as string | null],
    directeurAdjointId: [null as string | null],
    comiteGestion: this.fb.array<CommitteeRow>([]),
    thematiqueIds: [[] as string[]]
  });

  protected get committee(): FormArray<CommitteeRow> {
    return this.form.controls.comiteGestion;
  }

  protected fetch() {
    // Directors only see their own lab here; super admins see all of them.
    return this.labsService.findAll().pipe(
      map((labs) => this.auth.isSuperAdmin() ? labs : labs.filter((lab) => this.scope.isOwnLab(lab.acronym)))
    );
  }

  protected matches(lab: LabDTO, term: string): boolean {
    return matchesSearch(term, lab.acronym, lab.titleFr, lab.titleEn, lab.university);
  }

  protected openCreate(): void {
    this.current = null;
    this.editingId.set(null);
    this.labMembers.set([]);
    this.extraThemes.set([]);
    this.committee.clear();
    this.form.reset({ thematiqueIds: [] });
    this.dialogVisible.set(true);
  }

  protected openEdit(lab: LabDTO): void {
    this.current = lab;
    this.editingId.set(lab.id ?? null);
    this.extraThemes.set([]);
    this.labMembers.set(lab.members ?? []);
    this.membersService.findByLabAcronym(lab.acronym as string).subscribe({ next: (members) => this.labMembers.set(members) });
    this.committee.clear();
    (lab.comiteGestion ?? []).forEach((seat) => this.committee.push(this.committeeRow(seat.memberId ?? null, seat.nomEnseignant ?? '', seat.roleComite ?? '')));
    this.form.patchValue({
      acronym: lab.acronym ?? '',
      titleFr: lab.titleFr ?? '',
      titleEn: lab.titleEn ?? '',
      university: lab.university ?? '',
      establishment: lab.establishment ?? '',
      program: lab.program ?? '',
      phone: lab.phone ?? '',
      email: lab.email ?? '',
      accreditationStart: parseIsoDate(lab.accreditationStart),
      accreditationEnd: parseIsoDate(lab.accreditationEnd),
      directeurId: lab.directeur?.id ?? null,
      directeurAdjointId: lab.directeurAdjoint?.id ?? null,
      thematiqueIds: (lab.thematiquesRecherche ?? []).map((theme) => theme.id as string)
    });
    this.dialogVisible.set(true);
  }

  protected addCommitteeRow(): void {
    this.committee.push(this.committeeRow(null, '', ''));
  }

  protected onCommitteeMember(row: CommitteeRow): void {
    const member = this.labMembers().find((m) => m.id === row.controls.memberId.value);
    if (member && !row.controls.nomEnseignant.value) {
      row.controls.nomEnseignant.setValue(memberName(member));
    }
  }

  protected addTheme(input: HTMLInputElement): void {
    const name = input.value.trim();
    input.value = '';
    if (!name) return;
    const existing = this.thematiqueOptions().find((option) => option.label.toLowerCase() === name.toLowerCase());
    const value = existing?.value ?? `new:${name}`;
    if (!existing) {
      this.extraThemes.update((themes) => [...themes, { name }]);
    }
    const selected = this.form.controls.thematiqueIds.value ?? [];
    if (!selected.includes(value)) {
      this.form.controls.thematiqueIds.setValue([...selected, value]);
    }
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload: LabDTO = {
      acronym: value.acronym?.trim(),
      titleFr: value.titleFr?.trim(),
      titleEn: value.titleEn?.trim(),
      university: value.university?.trim() || undefined,
      establishment: value.establishment?.trim() || undefined,
      program: value.program?.trim() || undefined,
      phone: value.phone?.trim() || undefined,
      email: value.email?.trim() || undefined,
      accreditationStart: toIsoDate(value.accreditationStart),
      accreditationEnd: toIsoDate(value.accreditationEnd),
      department: this.current?.department,
      tags: this.current?.tags,
      directeur: value.directeurId ? { id: value.directeurId } : null,
      directeurAdjoint: value.directeurAdjointId ? { id: value.directeurAdjointId } : null,
      comiteGestion: this.editingId()
        ? value.comiteGestion
          .filter((row) => row.memberId || row.nomEnseignant?.trim())
          .map((row) => ({ memberId: row.memberId, nomEnseignant: row.nomEnseignant?.trim(), roleComite: row.roleComite?.trim() }))
        : [],
      thematiquesRecherche: (value.thematiqueIds ?? []).map((id) => id.startsWith('new:') ? { name: id.substring(4) } : { id })
    };
    const id = this.editingId();
    this.persist(id ? this.labsService.update(id, payload) : this.labsService.create(payload),
      id ? 'Laboratoire mis à jour' : 'Laboratoire créé');
  }

  /** Lab list changes also refresh the lab selectors used by the other pages. */
  protected override reload(lab: string | null = this.scope.currentLab()): void {
    super.reload(lab);
    this.scope.loadLabs();
  }

  protected remove(lab: LabDTO): void {
    this.askDelete(lab.acronym ?? 'ce laboratoire', () => this.labsService.delete(lab.id as string));
  }

  private committeeRow(memberId: string | null, nomEnseignant: string, roleComite: string): CommitteeRow {
    return this.fb.group({
      memberId: [memberId],
      nomEnseignant: [nomEnseignant],
      roleComite: [roleComite]
    }) as CommitteeRow;
  }
}
