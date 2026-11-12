import { computed, effect, inject, signal, untracked } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthService } from '../../../core/auth/auth.service';
import { AdminScopeService } from './admin-scope.service';
import { apiErrorMessage } from './admin-utils';

/**
 * Shared state of the dashboard list pages: data loading scoped to the current lab,
 * search, edit dialog, save and delete with toasts / confirmation.
 */
export abstract class AdminCrudPage<T extends { id?: string }> {
  protected readonly scope = inject(AdminScopeService);
  protected readonly auth = inject(AuthService);
  protected readonly messages = inject(MessageService);
  private readonly confirmation = inject(ConfirmationService);

  protected readonly items = signal<T[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly search = signal('');
  protected readonly dialogVisible = signal(false);
  /** Id of the record being edited; null while creating. */
  protected readonly editingId = signal<string | null>(null);

  protected readonly filtered = computed(() => {
    const term = this.search();
    return this.items().filter((item) => this.matches(item, term));
  });

  constructor() {
    effect(() => {
      const lab = this.scope.currentLab();
      untracked(() => this.reload(lab));
    });
  }

  /** Loads the records of a lab, or of all labs when lab is null. */
  protected abstract fetch(lab: string | null): Observable<T[]>;

  protected abstract matches(item: T, term: string): boolean;

  protected reload(lab: string | null = this.scope.currentLab()): void {
    this.loading.set(true);
    this.fetch(lab).subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notifyError(err, 'Chargement impossible.');
      }
    });
  }

  protected closeDialog(): void {
    this.dialogVisible.set(false);
  }

  /** Runs a create / update request and refreshes the list on success. */
  protected persist(request: Observable<unknown>, successMessage: string): void {
    this.saving.set(true);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.messages.add({ severity: 'success', summary: successMessage });
        this.reload();
      },
      error: (err) => {
        this.saving.set(false);
        this.notifyError(err);
      }
    });
  }

  protected askDelete(label: string, request: () => Observable<void>): void {
    this.confirmation.confirm({
      header: 'Confirmer la suppression',
      message: `Supprimer « ${label} » ? Cette action est définitive.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => request().subscribe({
        next: () => {
          this.messages.add({ severity: 'success', summary: 'Élément supprimé' });
          this.reload();
        },
        error: (err) => this.notifyError(err, 'Suppression impossible.')
      })
    });
  }

  protected notifyError(error: unknown, fallback?: string): void {
    this.messages.add({ severity: 'error', summary: 'Erreur', detail: apiErrorMessage(error, fallback), life: 6000 });
  }
}
