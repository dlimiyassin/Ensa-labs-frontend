import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { LabDTO, PublicationDTO } from '../../../core/models/api.models';
import { LabsService } from '../../../core/services/labs.service';
import { Option } from './labels';

/**
 * Lab scope of the dashboard and UI-side permission helpers. They mirror the backend rules
 * (which remain the source of truth) so the UI only offers allowed actions.
 */
@Injectable({ providedIn: 'root' })
export class AdminScopeService {
  private readonly auth = inject(AuthService);
  private readonly labsService = inject(LabsService);

  private readonly labsState = signal<LabDTO[]>([]);
  /** Lab filter chosen by a super admin; null means "all labs". */
  private readonly selectedLabState = signal<string | null>(null);

  readonly labs = this.labsState.asReadonly();
  readonly labOptions = computed<Option[]>(() => this.labsState()
    .filter((lab) => !!lab.acronym)
    .map((lab) => ({ value: lab.acronym as string, label: `${lab.acronym} — ${lab.titleFr ?? ''}`.trim() })));

  /** Labs the user may assign records to. */
  readonly writableLabOptions = computed<Option[]>(() => this.auth.isSuperAdmin()
    ? this.labOptions()
    : this.labOptions().filter((option) => option.value === this.auth.labAcronym()));

  /** Lab currently displayed: the user's own lab, or the super admin's filter. */
  readonly currentLab = computed<string | null>(() => this.auth.isSuperAdmin() ? this.selectedLabState() : this.auth.labAcronym());
  readonly canSwitchLab = computed(() => this.auth.isSuperAdmin());

  loadLabs(): void {
    this.labsService.findAll().pipe(
      tap((labs) => this.labsState.set(labs)),
      catchError(() => of([]))
    ).subscribe();
  }

  selectLab(acronym: string | null): void {
    this.selectedLabState.set(acronym || null);
  }

  /** Default lab for a new record. */
  defaultLab(): string | null {
    return this.currentLab() ?? this.writableLabOptions()[0]?.value ?? null;
  }

  isOwnLab(acronym: string | null | undefined): boolean {
    return !!acronym && acronym === this.auth.labAcronym();
  }

  /** Structure of a lab: members, teams, collaborations, resources. */
  canManageLab(acronym: string | null | undefined): boolean {
    return this.auth.isSuperAdmin() || (this.auth.isLabDirector() && this.isOwnLab(acronym));
  }

  /** Theses and productions. */
  canEditProduction(acronym: string | null | undefined): boolean {
    return this.canManageLab(acronym) || (this.auth.isTeamLeader() && this.isOwnLab(acronym));
  }

  canEditPublication(publication: PublicationDTO): boolean {
    if (this.canManageLab(publication.labAcronym)) return true;
    const user = this.auth.currentUser();
    if (this.auth.isTeamLeader() && !!publication.equipeId && (user?.ledEquipeIds ?? []).includes(publication.equipeId)) return true;
    return !!user && publication.createdBy === user.username && this.isOwnLab(publication.labAcronym);
  }

  canDeletePublication(publication: PublicationDTO): boolean {
    return this.canManageLab(publication.labAcronym);
  }
}
