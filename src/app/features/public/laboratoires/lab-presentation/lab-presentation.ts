import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';

import { LabsService } from '../../../../core/services/labs.service';
import { AssociationType, ComiteGestionMembreDTO, LabDTO, MemberDTO } from '../../../../core/models/api.models';
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

interface TeamModel {
  name: string;
  responsable: MemberCardModel;
  members: MemberCardModel[];
  axes: string[];
  themes: string[];
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

  private readonly fragment = toSignal(this.route.fragment, { initialValue: null });

  protected readonly lab = toSignal(
    combineLatest([
      this.route.paramMap.pipe(map((params) => (params.get('code') ?? '').trim()), distinctUntilChanged()),
      this.labsService.findAll().pipe(catchError(() => of<LabDTO[]>([])))
    ]).pipe(
      tap(() => {
        this.loading.set(true);
        this.error.set('');
      }),
      map(([routeCode, labs]) => this.findLabByRouteCode(routeCode, labs) ?? this.findLabByRouteCode('LaRESI', labs) ?? null),
      switchMap((lab) => this.labsService.findByAcronym(lab?.acronym ?? 'LaRESI').pipe(
        catchError(() => {
          this.error.set('Impossible de charger les informations du laboratoire.');
          return of<LabDTO | null>(null);
        })
      )),
      tap(() => {
        this.loading.set(false);
        this.syncTabFromFragment();
      })
    ),
    { initialValue: null }
  );

  protected readonly selectedLabCode = computed(() => this.labIdentifier(this.lab()) || 'LaRESI');
  protected readonly heroTitle = computed(() => this.lab()?.titleFr || this.lab()?.acronym || this.selectedLabCode());
  protected readonly heroImage = computed(() => this.resolveLabImage(this.lab()?.acronym));

  protected readonly permanentMembers = computed(() => this.membersByAssociation('PERMENANET'));
  protected readonly associatedMembers = computed(() => this.membersByAssociation('ASSOCIATED'));

  protected readonly teams = computed<TeamModel[]>(() => (this.lab()?.equipes ?? [])
    .map((team) => ({
      name: (team.name ?? '').trim(),
      responsable: this.toMemberCard(team.responsable, 'Responsable'),
      members: (team.members ?? []).map((member) => this.toMemberCard(member)).filter((member) => !!member.name),
      axes: this.readAxesTitles(team),
      themes: this.readTeamThemes(team)
    }))
    .filter((team) => !!team.name));

  protected readonly hasTeams = computed(() => this.teams().length > 0);
  protected readonly directAxes = computed(() => this.readAxesTitles(this.lab()).filter(Boolean));
  protected readonly groupedAxesFromTeams = computed(() => this.teams()
    .filter((team) => team.axes.length > 0)
    .map((team) => ({ team: team.name, axes: team.axes })));
  protected readonly groupedThemesFromTeams = computed(() => this.teams()
    .filter((team) => team.themes.length > 0)
    .map((team) => ({ team: team.name, themes: team.themes })));
  protected readonly thematiques = computed(() => {
    const topLevel = this.readThemesFromLab(this.lab());
    if (topLevel.length > 0) return topLevel;
    return this.groupedThemesFromTeams().flatMap((group) => group.themes);
  });
  protected readonly hasAxes = computed(() => this.directAxes().length > 0 || this.groupedAxesFromTeams().length > 0);
  protected readonly hasThemes = computed(() => this.thematiques().length > 0 || this.groupedThemesFromTeams().length > 0);

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

  private labIdentifier(lab: LabDTO | null | undefined): string {
    return ((lab as { code?: string } | null)?.code ?? lab?.acronym ?? '').trim();
  }

  private findLabByRouteCode(routeCode: string, labs: readonly LabDTO[]): LabDTO | null {
    const normalized = routeCode.trim().toLowerCase();
    if (!normalized) return null;
    return labs.find((lab) => {
      const candidates = [
        this.labIdentifier(lab),
        lab.acronym ?? '',
        lab.titleFr ?? '',
        lab.titleEn ?? ''
      ].map((value) => value.trim().toLowerCase());
      return candidates.includes(normalized);
    }) ?? null;
  }

  private readAxesTitles(entity: unknown): string[] {
    if (!entity) return [];
    const typed = entity as { axesRecherche?: { title?: string }[]; axes_de_recherche?: { title?: string; name?: string; intitule?: string }[] };
    const raw = typed.axesRecherche ?? typed.axes_de_recherche ?? [];
    return raw
      .map((axe) => (axe?.title ?? (axe as { name?: string }).name ?? (axe as { intitule?: string }).intitule ?? '').trim())
      .filter(Boolean);
  }

  private readThemesFromLab(entity: LabDTO | null): string[] {
    const raw = entity?.domainesRecherche ?? [];
    return raw
      .map((item) => (item.name ?? '').trim())
      .filter(Boolean);
  }

  private readTeamThemes(entity: unknown): string[] {
    const typed = entity as {
      thematiques_de_recherche?: { title?: string; name?: string }[];
      domainesRecherche?: { title?: string; name?: string }[];
    };
    const raw = typed.thematiques_de_recherche ?? typed.domainesRecherche ?? [];
    return raw.map((item) => (item.title ?? item.name ?? '').trim()).filter(Boolean);
  }
}
