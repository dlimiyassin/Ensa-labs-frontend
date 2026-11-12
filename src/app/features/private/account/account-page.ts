import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/auth/auth.service';
import { AccountService } from '../../../core/services/account.service';
import { apiErrorMessage } from '../shared/admin-utils';
import { ROLE_LABELS } from '../shared/labels';
import { AdminPageHeaderComponent } from '../shared/page-header';

function samePasswords(group: AbstractControl): ValidationErrors | null {
  const value = group.value as { newPassword?: string; confirmPassword?: string };
  return value.newPassword === value.confirmPassword ? null : { mismatch: true };
}

@Component({
  selector: 'app-account-page',
  imports: [ReactiveFormsModule, ButtonModule, PasswordModule, AdminPageHeaderComponent],
  template: `
    <app-admin-page-header title="Mon compte" subtitle="Informations du compte et sécurité." [searchable]="false" [showLabFilter]="false" />

    <div class="admin-grid-2">
      <section class="admin-panel">
        <h2>Profil</h2>
        <dl class="admin-definition">
          <div><dt>Nom</dt><dd>{{ auth.displayName() || '—' }}</dd></div>
          <div><dt>Identifiant</dt><dd>{{ user()?.username }}</dd></div>
          <div><dt>E-mail</dt><dd>{{ user()?.email || '—' }}</dd></div>
          <div><dt>Laboratoire</dt><dd>{{ user()?.labAcronym || 'Aucun (compte non rattaché à un membre)' }}</dd></div>
          <div><dt>Rôles</dt><dd>{{ roles() }}</dd></div>
        </dl>
        <p class="admin-muted">Les informations du profil sont gérées par un super administrateur.</p>
      </section>

      <section class="admin-panel">
        <h2>Changer le mot de passe</h2>
        <form class="admin-form" [formGroup]="form" (ngSubmit)="submit()">
          <label class="admin-field">
            <span>Mot de passe actuel *</span>
            <p-password formControlName="currentPassword" [feedback]="false" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full" autocomplete="current-password" />
          </label>
          <label class="admin-field">
            <span>Nouveau mot de passe * <small>(6 caractères minimum)</small></span>
            <p-password formControlName="newPassword" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full" autocomplete="new-password"
                        promptLabel="Choisissez un mot de passe" weakLabel="Faible" mediumLabel="Moyen" strongLabel="Fort" />
          </label>
          <label class="admin-field">
            <span>Confirmation *</span>
            <p-password formControlName="confirmPassword" [feedback]="false" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full" autocomplete="new-password" />
          </label>
          @if (form.touched && form.hasError('mismatch')) {
            <small class="admin-error">Les deux mots de passe ne correspondent pas.</small>
          }
          <div class="admin-form__actions">
            <p-button type="submit" label="Mettre à jour" icon="pi pi-check" [loading]="saving()" />
          </div>
        </form>
      </section>
    </div>
  `
})
export class AccountPage {
  protected readonly auth = inject(AuthService);
  private readonly account = inject(AccountService);
  private readonly messages = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  protected readonly user = this.auth.currentUser;
  protected readonly saving = signal(false);
  protected readonly roles = computed(() => this.auth.roles().map((role) => ROLE_LABELS[role]).join(', ') || '—');

  protected readonly form = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: samePasswords });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword } = this.form.getRawValue();
    this.saving.set(true);
    this.account.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.reset();
        this.messages.add({ severity: 'success', summary: 'Mot de passe modifié' });
      },
      error: (err) => {
        this.saving.set(false);
        this.messages.add({ severity: 'error', summary: 'Erreur', detail: apiErrorMessage(err) });
      }
    });
  }
}
