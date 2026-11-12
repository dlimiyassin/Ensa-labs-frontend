import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { MemberDTO } from '../../../core/models/api.models';
import { FilesService } from '../../../core/services/files.service';
import { MembersService } from '../../../core/services/members.service';
import { AdminCrudPage } from '../shared/admin-crud-page';
import { matchesSearch, memberName, splitLines } from '../shared/admin-utils';
import { ImageUploadComponent } from '../shared/image-upload';
import {
  ASSOCIATION_LABELS,
  ASSOCIATION_OPTIONS,
  GRADE_OPTIONS,
  ROLE_IN_LAB_LABELS,
  ROLE_IN_LAB_OPTIONS
} from '../shared/labels';
import { AdminPageHeaderComponent } from '../shared/page-header';

@Component({
  selector: 'app-members-admin',
  imports: [
    ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, SelectModule, TableModule, TagModule, TextareaModule,
    TooltipModule, AdminPageHeaderComponent, ImageUploadComponent
  ],
  template: `
    <app-admin-page-header title="Membres" subtitle="Enseignants-chercheurs rattachés aux laboratoires."
      addLabel="Nouveau membre" [search]="search()" (searchChange)="search.set($event)" (add)="openCreate()" />

    <section class="admin-panel admin-panel--flush">
      <p-table [value]="filtered()" [loading]="loading()" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 25, 50]"
               sortField="lastName" [sortOrder]="1" dataKey="id" responsiveLayout="scroll">
        <ng-template #header>
          <tr>
            <th style="width: 4rem"></th>
            <th pSortableColumn="lastName">Nom <p-sortIcon field="lastName" /></th>
            <th pSortableColumn="grade">Grade <p-sortIcon field="grade" /></th>
            <th>Spécialité</th>
            <th pSortableColumn="labAcronym">Labo <p-sortIcon field="labAcronym" /></th>
            <th>Statut</th>
            <th style="width: 7rem"></th>
          </tr>
        </ng-template>
        <ng-template #body let-member>
          <tr>
            <td>
              <img class="admin-thumb is-round" [src]="files.imageUrl(member.image) || 'images/members/member.png'" [alt]="name(member)" />
            </td>
            <td>
              <strong>{{ name(member) }}</strong>
              @if (member.roleInLab && member.roleInLab !== 'MEMBER') {
                <div><p-tag [value]="roleInLabLabels[member.roleInLab]" severity="info" /></div>
              }
            </td>
            <td>{{ member.grade || '—' }}</td>
            <td class="admin-cell-wrap">{{ member.speciality || '—' }}</td>
            <td>{{ member.labAcronym }}</td>
            <td>{{ associationLabels[member.associationType] || '—' }}</td>
            <td class="admin-actions">
              @if (scope.canManageLab(member.labAcronym)) {
                <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" pTooltip="Modifier" (onClick)="openEdit(member)" />
                <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" pTooltip="Supprimer" (onClick)="remove(member)" />
              }
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr><td colspan="7" class="admin-empty">Aucun membre.</td></tr>
        </ng-template>
      </p-table>
    </section>

    <p-dialog [header]="editingId() ? 'Modifier le membre' : 'Nouveau membre'" [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
              [modal]="true" [style]="{ width: '46rem' }" [breakpoints]="{ '768px': '95vw' }" [draggable]="false">
      <form class="admin-form" [formGroup]="form" (ngSubmit)="save()" id="member-form">
        <app-image-upload folder="members" [round]="true" [path]="form.controls.image.value" (pathChange)="form.controls.image.setValue($event ?? null)" />
        <div class="admin-form__grid">
          <label class="admin-field"><span>Nom *</span><input pInputText formControlName="firstName" /></label>
          <label class="admin-field"><span>Prénom *</span><input pInputText formControlName="lastName" /></label>
          <label class="admin-field"><span>Grade</span>
            <p-select formControlName="grade" [options]="gradeOptions" optionLabel="label" optionValue="value" [showClear]="true" placeholder="—" appendTo="body" />
          </label>
          <label class="admin-field"><span>Laboratoire *</span>
            <p-select formControlName="labAcronym" [options]="scope.writableLabOptions()" optionLabel="value" optionValue="value" appendTo="body" />
          </label>
          <label class="admin-field"><span>Spécialité</span><input pInputText formControlName="speciality" /></label>
          <label class="admin-field"><span>Établissement</span><input pInputText formControlName="establishment" /></label>
          <label class="admin-field"><span>Type de rattachement</span>
            <p-select formControlName="associationType" [options]="associationOptions" optionLabel="label" optionValue="value" appendTo="body" />
          </label>
          <label class="admin-field"><span>Rôle dans le laboratoire</span>
            <p-select formControlName="roleInLab" [options]="roleInLabOptions" optionLabel="label" optionValue="value" appendTo="body" />
          </label>
        </div>
        <label class="admin-field"><span>Doctorants encadrés <small>(un par ligne)</small></span>
          <textarea pTextarea formControlName="phdStudents" rows="3"></textarea>
        </label>
      </form>
      <ng-template #footer>
        <p-button label="Annuler" severity="secondary" [outlined]="true" (onClick)="closeDialog()" />
        <p-button label="Enregistrer" icon="pi pi-check" (onClick)="save()" [loading]="saving()" [disabled]="form.invalid" />
      </ng-template>
    </p-dialog>
  `
})
export class MembersAdmin extends AdminCrudPage<MemberDTO> {
  private readonly membersService = inject(MembersService);
  protected readonly files = inject(FilesService);
  private readonly fb = inject(FormBuilder);

  protected readonly gradeOptions = GRADE_OPTIONS;
  protected readonly associationOptions = ASSOCIATION_OPTIONS;
  protected readonly roleInLabOptions = ROLE_IN_LAB_OPTIONS;
  protected readonly associationLabels: Record<string, string> = ASSOCIATION_LABELS;
  protected readonly roleInLabLabels: Record<string, string> = ROLE_IN_LAB_LABELS;
  protected readonly name = memberName;

  private current: MemberDTO | null = null;

  protected readonly form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    grade: [null as string | null],
    speciality: [''],
    establishment: [''],
    associationType: ['PERMENANET'],
    roleInLab: ['MEMBER'],
    labAcronym: ['', Validators.required],
    phdStudents: [''],
    image: [null as string | null]
  });

  protected fetch(lab: string | null) {
    return lab ? this.membersService.findByLabAcronym(lab) : this.membersService.findAll();
  }

  protected matches(member: MemberDTO, term: string): boolean {
    return matchesSearch(term, member.firstName, member.lastName, member.speciality, member.labAcronym, member.grade);
  }

  protected openCreate(): void {
    this.current = null;
    this.editingId.set(null);
    this.form.reset({ associationType: 'PERMENANET', roleInLab: 'MEMBER', labAcronym: this.scope.defaultLab() ?? '', image: null });
    this.dialogVisible.set(true);
  }

  protected openEdit(member: MemberDTO): void {
    this.current = member;
    this.editingId.set(member.id ?? null);
    this.form.reset({
      firstName: member.firstName ?? '',
      lastName: member.lastName ?? '',
      grade: member.grade ?? null,
      speciality: member.speciality ?? '',
      establishment: member.establishment ?? '',
      associationType: member.associationType ?? 'PERMENANET',
      roleInLab: member.roleInLab ?? 'MEMBER',
      labAcronym: member.labAcronym ?? '',
      phdStudents: (member.phdStudents ?? []).join('\n'),
      image: member.image ?? null
    });
    this.dialogVisible.set(true);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload: MemberDTO = {
      ...this.current,
      firstName: value.firstName?.trim(),
      lastName: value.lastName?.trim(),
      grade: (value.grade || undefined) as MemberDTO['grade'],
      speciality: value.speciality?.trim(),
      establishment: value.establishment?.trim(),
      associationType: value.associationType as MemberDTO['associationType'],
      roleInLab: value.roleInLab as MemberDTO['roleInLab'],
      labAcronym: value.labAcronym ?? undefined,
      phdStudents: splitLines(value.phdStudents),
      image: value.image
    };
    const id = this.editingId();
    this.persist(id ? this.membersService.update(id, payload) : this.membersService.create(payload),
      id ? 'Membre mis à jour' : 'Membre créé');
  }

  protected remove(member: MemberDTO): void {
    this.askDelete(memberName(member), () => this.membersService.delete(member.id as string));
  }
}
