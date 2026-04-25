import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';

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

  private readonly code = toSignal(this.route.paramMap.pipe(
    map((params) => (params.get('code') ?? 'LaRESI').trim()),
    distinctUntilChanged()
  ), { initialValue: 'LaRESI' });

  private readonly fragment = toSignal(this.route.fragment, { initialValue: null });

  protected readonly lab = toSignal(
    this.route.paramMap.pipe(
      map((params) => (params.get('code') ?? 'LaRESI').trim()),
      distinctUntilChanged(),
      tap(() => {
        this.loading.set(true);
        this.error.set('');
      }),
      switchMap((code) => this.labsService.findByAcronym(code).pipe(
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

  protected readonly heroTitle = computed(() => this.lab()?.titleFr || this.lab()?.acronym || this.code());
  protected readonly heroImage = computed(() => this.resolveLabImage(this.lab()?.acronym));

  protected readonly permanentMembers = computed(() => this.membersByAssociation('PERMENANET'));
  protected readonly associatedMembers = computed(() => this.membersByAssociation('ASSOCIATED'));

  protected readonly axes = computed(() => (this.lab()?.axesRecherche ?? []).map((item) => item.title ?? '').filter(Boolean));
  protected readonly teams = computed(() => (this.lab()?.equipes ?? [])
    .map((team) => ({
      name: (team.name ?? '').trim(),
      responsable: this.toMemberCard(team.responsable, 'Responsable'),
      members: (team.members ?? []).map((member) => this.toMemberCard(member)).filter((member) => !!member.name)
    }))
    .filter((team) => !!team.name));

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
}
