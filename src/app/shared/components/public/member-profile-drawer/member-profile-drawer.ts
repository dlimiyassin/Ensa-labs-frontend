import { Component, computed, inject, input, model } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { EquipeDTO, MemberDTO } from '../../../../core/models/api.models';
import { FilesService } from '../../../../core/services/files.service';

const GRADES: Record<string, string> = {
  PES: "Professeur de l'enseignement supérieur",
  MCH: 'Maître de conférences habilité',
  MCA: 'Maître de conférences',
  PA: 'Professeur assistant',
  OTHER: 'Autre'
};

const ROLES_IN_LAB: Record<string, string> = {
  DIRECTEUR: 'Directeur du laboratoire',
  DIRECTEUR_ADJOINT: 'Directeur adjoint',
  MANAGEMENT_COMMITTEE: 'Membre du comité de gestion',
  MEMBER: 'Membre'
};

/** Side panel with a researcher's public profile (opened from the lab page cards). */
@Component({
  selector: 'app-member-profile-drawer',
  imports: [DrawerModule, RouterLink],
  templateUrl: './member-profile-drawer.html',
  styleUrl: './member-profile-drawer.css'
})
export class MemberProfileDrawerComponent {
  private readonly files = inject(FilesService);

  readonly member = input<MemberDTO | null>(null);
  /** Teams of the lab, to list the ones the member belongs to or leads. */
  readonly equipes = input<readonly EquipeDTO[]>([]);
  readonly visible = model(false);

  protected readonly fullName = computed(() => `${this.member()?.firstName ?? ''} ${this.member()?.lastName ?? ''}`.trim());
  protected readonly avatar = computed(() => this.files.imageUrl(this.member()?.image) ?? 'images/members/member.png');
  protected readonly grade = computed(() => {
    const grade = this.member()?.grade;
    return grade ? GRADES[grade] ?? grade : '';
  });
  protected readonly roleInLab = computed(() => {
    const role = this.member()?.roleInLab;
    return role && role !== 'MEMBER' ? ROLES_IN_LAB[role] ?? role : '';
  });
  protected readonly association = computed(() => this.member()?.associationType === 'ASSOCIATED' ? 'Membre associé' : 'Membre permanent');
  protected readonly teams = computed(() => {
    const id = this.member()?.id;
    if (!id) return [];
    return this.equipes()
      .filter((team) => team.responsable?.id === id || (team.members ?? []).some((member) => member.id === id))
      .map((team) => ({ name: team.name ?? '', leader: team.responsable?.id === id }));
  });
  protected readonly phdStudents = computed(() => this.member()?.phdStudents ?? []);
}
