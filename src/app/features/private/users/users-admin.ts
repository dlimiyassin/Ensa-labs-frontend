import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { AppRole, MemberDTO, RoleDto, UserDTO, UserStatus } from '../../../core/models/api.models';
import { MembersService } from '../../../core/services/members.service';
import { RolesService } from '../../../core/services/roles.service';
import { UsersService } from '../../../core/services/users.service';
import { AdminCrudPage } from '../shared/admin-crud-page';
import { matchesSearch, memberName } from '../shared/admin-utils';
import { ROLE_LABELS, USER_STATUS_LABELS, USER_STATUS_OPTIONS } from '../shared/labels';
import { AdminPageHeaderComponent } from '../shared/page-header';

@Component({
  selector: 'app-users-admin',
  imports: [
    ReactiveFormsModule, DatePipe, ButtonModule, DialogModule, InputTextModule, MultiSelectModule, PasswordModule, SelectModule, TableModule,
    TagModule, ToggleSwitchModule, TooltipModule, AdminPageHeaderComponent
  ],
  template: `
    <app-admin-page-header title="Utilisateurs" subtitle="Comptes d'accès, rôles et rattachement à un membre (qui donne le périmètre labo / équipe)."
      addLabel="Nouvel utilisateur" [showLabFilter]="false" [search]="search()" (searchChange)="search.set($event)" (add)="openCreate()" />

    <section class="admin-panel admin-panel--flush">
      <p-table [value]="filtered()" [loading]="loading()" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 25, 50]"
               sortField="username" [sortOrder]="1" dataKey="id">
        <ng-template #header>
          <tr>
            <th pSortableColumn="username">Compte <p-sortIcon field="username" /></th>
            <th>Rôles</th>
            <th>Membre / labo</th>
            <th pSortableColumn="status">Statut <p-sortIcon field="status" /></th>
            <th pSortableColumn="lastLogin">Dernière connexion <p-sortIcon field="lastLogin" /></th>
            <th style="width: 7rem"></th>
          </tr>
        </ng-template>
        <ng-template #body let-user>
          <tr>
            <td>
              <strong>{{ user.username }}</strong>
              <div class="admin-muted">{{ fullName(user) }} {{ user.email ? '· ' + user.email : '' }}</div>
            </td>
            <td>
              <div class="admin-tags">
                @for (role of roleNames(user); track role) {
                  <p-tag [value]="role" [severity]="role === superAdminLabel ? 'danger' : 'info'" />
                }
              </div>
            </td>
            <td>{{ memberLabel(user.memberId) }}</td>
            <td>
              <p-tag [value]="statusLabels[user.status] || '—'" [severity]="user.status === 'ACTIF' && user.enabled ? 'success' : 'warn'" />
            </td>
            <td>{{ user.lastLogin ? (user.lastLogin | date: 'dd/MM/yyyy HH:mm') : 'Jamais' }}</td>
            <td class="admin-actions">
              <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" pTooltip="Modifier" (onClick)="openEdit(user)" />
              @if (user.id !== auth.currentUser()?.id) {
                <p-button icon="pi pi-trash" [text]="true" [rounded]="true" severity="danger" pTooltip="Supprimer" (onClick)="remove(user)" />
              }
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage><tr><td colspan="6" class="admin-empty">Aucun utilisateur.</td></tr></ng-template>
      </p-table>
    </section>

    <p-dialog [header]="editingId() ? 'Modifier l\\'utilisateur' : 'Nouvel utilisateur'" [visible]="dialogVisible()" (visibleChange)="dialogVisible.set($event)"
              [modal]="true" [style]="{ width: '46rem' }" [breakpoints]="{ '768px': '95vw' }" [draggable]="false">
      <form class="admin-form" [formGroup]="form" (ngSubmit)="save()" id="user-form">
        <div class="admin-form__grid">
          <label class="admin-field"><span>Nom d'utilisateur *</span><input pInputText formControlName="username" autocomplete="off" /></label>
          <label class="admin-field"><span>E-mail</span><input pInputText type="email" formControlName="email" /></label>
          <label class="admin-field"><span>Prénom</span><input pInputText formControlName="firstName" /></label>
          <label class="admin-field"><span>Nom</span><input pInputText formControlName="lastName" /></label>
          <label class="admin-field"><span>CIN</span><input pInputText formControlName="cin" /></label>
          <label class="admin-field"><span>Téléphone</span><input pInputText formControlName="phoneNumber" /></label>
          <label class="admin-field admin-field--wide"><span>Rôles *</span>
            <p-multiselect formControlName="roleIds" [options]="roleOptions()" optionLabel="label" optionValue="value" display="chip" [maxSelectedLabels]="100" selectedItemsLabel="{0} éléments"
                           placeholder="Choisir les rôles" appendTo="body" styleClass="w-full" />
          </label>
          <label class="admin-field admin-field--wide"><span>Membre rattaché</span>
            <p-select formControlName="memberId" [options]="memberOptions()" optionLabel="label" optionValue="value" [filter]="true"
                      [showClear]="true" placeholder="Aucun" appendTo="body" />
          </label>
          <label class="admin-field"><span>Statut</span>
            <p-select formControlName="status" [options]="statusOptions" optionLabel="label" optionValue="value" appendTo="body" />
          </label>
          <label class="admin-field admin-field--switch"><span>Compte activé</span>
            <p-toggleswitch formControlName="enabled" />
          </label>
          <label class="admin-field admin-field--wide">
            <span>{{ editingId() ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe (vide = CIN)' }}</span>
            <p-password formControlName="password" [toggleMask]="true" [feedback]="false" styleClass="w-full" inputStyleClass="w-full" autocomplete="new-password" />
          </label>
        </div>
        <small class="admin-muted">Un directeur ou chef d'équipe doit être rattaché à un membre : c'est ce lien qui définit son laboratoire et ses équipes.</small>
      </form>
      <ng-template #footer>
        <p-button label="Annuler" severity="secondary" [outlined]="true" (onClick)="closeDialog()" />
        <p-button label="Enregistrer" icon="pi pi-check" (onClick)="save()" [loading]="saving()" [disabled]="form.invalid" />
      </ng-template>
    </p-dialog>
  `
})
export class UsersAdmin extends AdminCrudPage<UserDTO> {
  private readonly usersService = inject(UsersService);
  private readonly rolesService = inject(RolesService);
  private readonly membersService = inject(MembersService);
  private readonly fb = inject(FormBuilder);

  protected readonly statusOptions = USER_STATUS_OPTIONS;
  protected readonly statusLabels: Record<string, string> = USER_STATUS_LABELS;
  protected readonly superAdminLabel = ROLE_LABELS.ROLE_SUPER_ADMIN;

  private readonly roles = toSignal(this.rolesService.findAll().pipe(catchError(() => of<RoleDto[]>([]))), { initialValue: [] });
  private readonly members = toSignal(this.membersService.findAll().pipe(catchError(() => of<MemberDTO[]>([]))), { initialValue: [] });

  protected readonly roleOptions = computed(() => this.roles()
    .map((role) => ({ value: role.id as string, label: ROLE_LABELS[role.name as AppRole] ?? role.name ?? '' })));
  protected readonly memberOptions = computed(() => this.members()
    .map((member) => ({ value: member.id as string, label: `${memberName(member)} (${member.labAcronym ?? '—'})` }))
    .sort((a, b) => a.label.localeCompare(b.label)));

  protected readonly form = this.fb.group({
    username: ['', Validators.required],
    email: ['', Validators.email],
    firstName: [''],
    lastName: [''],
    cin: [''],
    phoneNumber: [''],
    roleIds: [[] as string[], Validators.required],
    memberId: [null as string | null],
    status: ['ACTIF'],
    enabled: [true],
    password: ['', Validators.minLength(6)]
  });

  protected fetch() {
    return this.usersService.findAll();
  }

  protected matches(user: UserDTO, term: string): boolean {
    return matchesSearch(term, user.username, user.firstName, user.lastName, user.email, this.memberLabel(user.memberId), ...this.roleNames(user));
  }

  protected fullName(user: UserDTO): string {
    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  }

  protected roleNames(user: UserDTO): string[] {
    return (user.roleIds ?? [])
      .map((id) => this.roles().find((role) => role.id === id)?.name)
      .filter((name): name is string => !!name)
      .map((name) => ROLE_LABELS[name as AppRole] ?? name);
  }

  protected memberLabel(memberId: string | null | undefined): string {
    if (!memberId) return '—';
    const member = this.members().find((m) => m.id === memberId);
    return member ? `${memberName(member)} · ${member.labAcronym ?? ''}` : '—';
  }

  protected openCreate(): void {
    this.editingId.set(null);
    const researcher = this.roles().find((role) => role.name === 'ROLE_RESEARCHER')?.id;
    this.form.reset({ roleIds: researcher ? [researcher] : [], status: 'ACTIF', enabled: true, memberId: null, password: '' });
    this.dialogVisible.set(true);
  }

  protected openEdit(user: UserDTO): void {
    this.editingId.set(user.id ?? null);
    this.form.reset({
      username: user.username ?? '',
      email: user.email ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      cin: user.cin ?? '',
      phoneNumber: user.phoneNumber ?? '',
      roleIds: user.roleIds ?? [],
      memberId: user.memberId ?? null,
      status: user.status ?? 'ACTIF',
      enabled: user.enabled ?? true,
      password: ''
    });
    this.dialogVisible.set(true);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload: UserDTO = {
      username: value.username?.trim(),
      email: value.email?.trim() || undefined,
      firstName: value.firstName?.trim() || undefined,
      lastName: value.lastName?.trim() || undefined,
      cin: value.cin?.trim() || undefined,
      phoneNumber: value.phoneNumber?.trim() || undefined,
      roleIds: value.roleIds ?? [],
      memberId: value.memberId,
      status: (value.status ?? 'ACTIF') as UserStatus,
      enabled: !!value.enabled,
      password: value.password || undefined
    };
    const id = this.editingId();
    this.persist(id ? this.usersService.update(id, payload) : this.usersService.create(payload),
      id ? 'Utilisateur mis à jour' : 'Utilisateur créé');
  }

  protected remove(user: UserDTO): void {
    this.askDelete(user.username ?? 'ce compte', () => this.usersService.delete(user.id as string));
  }
}
