import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';

import { LabsService } from '../../../../core/services/labs.service';
import { AssociationType, ComiteGestionMembreDTO, EquipeDTO, LabDTO, MemberDTO } from '../../../../core/models/api.models';
import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero';
import { SectionTitleComponent } from '../../../../shared/components/public/section-title/section-title';
import { EmptyStateComponent } from '../../../../shared/components/public/empty-state/empty-state';
import { TabsComponent, TabItem } from '../../../../shared/components/public/tabs/tabs';
import { FadeContainerComponent } from '../../../../shared/components/public/fade-container/fade-container';
import { EnhancedMemberCardComponent } from '../../../../shared/components/public/enhanced-member-card/enhanced-member-card';
import { SpinnerComponent } from '../../../../shared/components/public/spinner/spinner';

type LabTab = 'direction' | 'members' | 'equipes' | 'axes';

interface MemberCardModel {
  name: string;
  grade: string;
  speciality: string;
  role: string;
}

interface TeamViewModel {
  name: string;
  description: string;
  responsable: MemberCardModel;
  members: MemberCardModel[];
}

interface AxisGroupModel {
  teamName: string;
  axes: string[];
}

@Component({
  selector: 'app-lab-presentation',
  imports: [
    PageHeroComponent,
    SectionTitleComponent,
    EmptyStateComponent,
    TabsComponent,
    FadeContainerComponent,
    EnhancedMemberCardComponent,
    SpinnerComponent
  ],
  templateUrl: './lab-presentation.html',
  styleUrl: './lab-presentation.css'
})
export class LabPresentation {
  protected readonly memberAvatar = 'images/members/member.png';

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly labsService = inject(LabsService);

  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly activeTab = signal<LabTab>('direction');

  protected readonly tabs: readonly TabItem[] = [
    { id: 'direction', label: 'Direction' },
    { id: 'members', label: 'Membres' },
    { id: 'equipes', label: 'Équipes' },
    { id: 'axes', label: 'Axes' }
  ];

  private readonly labs = toSignal(this.labsService.findAll().pipe(catchError(() => of<LabDTO[]>([]))), { initialValue: [] });

  private readonly routeCode = toSignal(this.route.paramMap.pipe(
    map((params) => (params.get('code') ?? '').trim()),
    distinctUntilChanged()
  ), { initialValue: '' });

  protected readonly selectedLabCode = computed(() => this.resolveLabCode(this.routeCode()));

  private readonly fragment = toSignal(this.route.fragment, { initialValue: null });

  protected readonly lab = toSignal(
    this.route.paramMap.pipe(
      map((params) => (params.get('code') ?? '').trim()),
      distinctUntilChanged(),
      tap(() => {
        this.loading.set(true);
        this.error.set('');
      }),
      switchMap((code) => {
        const selectedLab = this.resolveLab(this.resolveLabCode(code));
        if (!selectedLab) {
          this.error.set('Impossible de charger les informations du laboratoire.');
          this.loading.set(false);
          return of<LabDTO | null>(null);
        }

        return of(selectedLab).pipe(tap(() => this.loading.set(false)));
      }),
      tap(() => this.syncTabFromFragment())
    ),
    { initialValue: null }
  );

  constructor() {
    effect(() => {
      const code = this.selectedLabCode();
      if (!code) {
        return;
      }

      if (this.routeCode() !== code) {
        this.router.navigate(['/laboratoires', code], {
          fragment: this.fragment() ?? undefined,
          replaceUrl: true
        });
      }
    });
  }

  protected readonly heroTitle = computed(() => this.lab()?.titleFr || this.lab()?.acronym || this.selectedLabCode());
  protected readonly heroImage = computed(() => this.resolveLabImage(this.lab()?.acronym));

  protected readonly permanentMembers = computed(() => this.membersByAssociation('PERMENANET'));
  protected readonly associatedMembers = computed(() => this.membersByAssociation('ASSOCIATED'));

  protected readonly teams = computed<TeamViewModel[]>(() => (this.lab()?.equipes ?? [])
    .map((team) => ({
      name: (team.name ?? '').trim(),
      description: this.getTeamDescription(team),
      responsable: this.toMemberCard(team.responsable, 'Responsable'),
      members: (team.members ?? []).map((member) => this.toMemberCard(member)).filter((member) => !!member.name)
    }))
    .filter((team) => !!team.name));

  protected readonly hasTeams = computed(() => this.teams().length > 0);

  protected readonly axesOfResearch = computed(() => this.resolveTypedAxes('axes'));
  protected readonly researchThemes = computed(() => this.resolveTypedAxes('themes'));

  protected readonly committee = computed(() => {
    const grouped = new Map<string, Set<string>>();

    for (const member of this.lab()?.comiteGestion ?? []) {
      const card = this.toCommitteeCard(member);
      if (!card.name) continue;

      if (!grouped.has(card.name)) {
        grouped.set(card.name, new Set<string>());
      }

      if (card.role) {
        grouped.get(card.name)?.add(card.role);
      }
    }

    return Array.from(grouped.entries()).map(([name, roles]) => ({
      name,
      roles: Array.from(roles).join(', ')
    }));
  });

  protected readonly direction = computed(() => {
    const directors = [
      this.toDirectionCard(this.lab()?.directeur, 'Directeur'),
      this.toDirectionCard(this.lab()?.directeurAdjoint, 'Directeur adjoint')
    ];
    return directors.filter((member) => !!member.name);
  });

  protected readonly hasAbout = computed(() => {
    const entity = this.lab();
    return Boolean(entity?.titleFr || entity?.acronym || entity?.university || entity?.program);
  });

  protected selectTab(tabId: string): void {
    this.activeTab.set(tabId as LabTab);
  }

  private resolveTypedAxes(kind: 'axes' | 'themes'): AxisGroupModel[] {
    const current = this.lab();
    if (!current) {
      return [];
    }

    const directAxes = (current.axesRecherche ?? [])
      .map((item) => ({
        title: (item.title ?? '').trim(),
        type: (item.type ?? 'AXE').toUpperCase(),
        teamName: 'Laboratoire'
      }))
      .filter((item) => !!item.title);

    const groupedFromLab = kind === 'axes'
      ? directAxes.filter((item) => item.type !== 'THEMATIQUE')
      : directAxes.filter((item) => item.type === 'THEMATIQUE');

    if (groupedFromLab.length > 0) {
      return [{ teamName: 'Laboratoire', axes: groupedFromLab.map((item) => item.title) }];
    }

    return (current.equipes ?? [])
      .map((team) => {
        const rawAxes = this.extractTeamAxes(team, kind);
        return {
          teamName: (team.name ?? 'Équipe').trim(),
          axes: rawAxes
        };
      })
      .filter((item) => item.axes.length > 0);
  }

  private extractTeamAxes(team: EquipeDTO, kind: 'axes' | 'themes'): string[] {
    const typedAxes = (team.axesRecherche ?? [])
      .filter((axis) => {
        const axisType = (axis.type ?? 'AXE').toUpperCase();
        return kind === 'axes' ? axisType !== 'THEMATIQUE' : axisType === 'THEMATIQUE';
      })
      .map((axis) => (axis.title ?? '').trim())
      .filter(Boolean);

    if (typedAxes.length > 0) {
      return typedAxes;
    }

    const teamData = team as EquipeDTO & {
      axes_de_recherche?: Array<string | { title?: string; nom?: string }>;
      thematiques_de_recherche?: Array<string | { title?: string; nom?: string }>;
    };

    const source = kind === 'axes' ? teamData.axes_de_recherche : teamData.thematiques_de_recherche;
    return (source ?? [])
      .map((entry) => typeof entry === 'string' ? entry.trim() : (entry.title ?? entry.nom ?? '').trim())
      .filter(Boolean);
  }

  private getTeamDescription(team: EquipeDTO): string {
    const raw = team as EquipeDTO & { description_fr?: string; descriptionFr?: string };
    return (team.description ?? raw.description_fr ?? raw.descriptionFr ?? '').trim();
  }

  private syncTabFromFragment(): void {
    const fragment = (this.fragment() ?? '').toLowerCase();
    if (fragment === 'axes') {
      this.activeTab.set('axes');
      return;
    }

    if (fragment === 'equipes' || fragment === 'teams') {
      this.activeTab.set('equipes');
      return;
    }

    if (fragment === 'members' || fragment === 'membres') {
      this.activeTab.set('members');
      return;
    }

    this.activeTab.set('direction');
  }

  private resolveLabCode(rawCode: string): string {
    const allLabs = this.labs();
    if (allLabs.length === 0) {
      return 'LaRESI';
    }

    const normalized = rawCode.trim().toLowerCase();
    const matching = allLabs.find((lab) => {
      const code = (lab.code ?? '').trim().toLowerCase();
      const acronym = (lab.acronym ?? '').trim().toLowerCase();
      return normalized && (code === normalized || acronym === normalized);
    });

    if (matching) {
      return this.getLabCode(matching);
    }

    const laresi = allLabs.find((lab) => {
      const code = (lab.code ?? '').trim().toLowerCase();
      const acronym = (lab.acronym ?? '').trim().toLowerCase();
      return code === 'laresi' || acronym === 'laresi';
    });

    return this.getLabCode(laresi ?? allLabs[0]);
  }

  private getLabCode(lab: LabDTO): string {
    return (lab.code ?? lab.acronym ?? '').trim();
  }

  private resolveLab(code: string): LabDTO | undefined {
    const normalized = code.trim().toLowerCase();
    return this.labs().find((lab) => this.getLabCode(lab).toLowerCase() === normalized);
  }

  private membersByAssociation(type: AssociationType): MemberCardModel[] {
    return (this.lab()?.members ?? [])
      .filter((member) => member.associationType === type)
      .map((member) => this.toMemberCard(member, member.associationType === 'PERMENANET' ? 'Permanent' : 'Associé'))
      .filter((member) => !!member.name);
  }

  protected toMemberCard(member: MemberDTO | undefined, role = ''): MemberCardModel {
    return {
      name: `${member?.firstName ?? ''} ${member?.lastName ?? ''}`.trim(),
      grade: (member?.grade ?? '').trim(),
      speciality: (member?.speciality ?? '').trim(),
      role
    };
  }

  protected toCommitteeCard(member: ComiteGestionMembreDTO): { name: string; role: string } {
    return {
      name: (member.nomEnseignant ?? '').trim(),
      role: (member.roleComite ?? '').trim()
    };
  }

  protected toDirectionCard(member: MemberDTO | undefined, role: string): MemberCardModel {
    return {
      name: `${member?.firstName ?? ''} ${member?.lastName ?? ''}`.trim(),
      grade: (member?.grade ?? '').trim(),
      speciality: (member?.speciality ?? '').trim(),
      role
    };
  }

  private resolveLabImage(acronym?: string): string {
    if (acronym === 'LRSTA') {
      return 'images/labs/lab1.jpg';
    }

    if (acronym === 'LaRESI') {
      return 'images/labs/lab2.jpg';
    }

    return 'images/labs/lab1.jpg';
  }
}
