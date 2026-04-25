import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';

import { LabsService } from '../../../../core/services/labs.service';
import { AssociationType, LabDTO, MemberDTO } from '../../../../core/models/api.models';
import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero';
import { AnimatedSectionComponent } from '../../../../shared/components/public/animated-section/animated-section';
import { SectionTitleComponent } from '../../../../shared/components/public/section-title/section-title';
import { ListBlockComponent } from '../../../../shared/components/public/list-block/list-block';
import { EmptyStateComponent } from '../../../../shared/components/public/empty-state/empty-state';

@Component({
  selector: 'app-lab-presentation',
  imports: [
    PageHeroComponent,
    AnimatedSectionComponent,
    SectionTitleComponent,
    ListBlockComponent,
    EmptyStateComponent
  ],
  templateUrl: './lab-presentation.html',
  styleUrl: './lab-presentation.css'
})
export class LabPresentation {
  private readonly route = inject(ActivatedRoute);
  private readonly labsService = inject(LabsService);

  protected readonly loading = signal(true);
  protected readonly error = signal('');

  private readonly code = toSignal(this.route.paramMap.pipe(
    map((params) => (params.get('code') ?? 'LaRESI').trim()),
    distinctUntilChanged()
  ), { initialValue: 'LaRESI' });

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
      tap(() => this.loading.set(false))
    ),
    { initialValue: null }
  );

  protected readonly heroTitle = computed(() => this.lab()?.titleFr || this.lab()?.acronym || this.code());

  protected readonly heroImage = computed(() => this.resolveLabImage(this.lab()?.acronym));

  protected readonly permanentMembers = computed(() => this.membersByAssociation('PERMENANET'));
  protected readonly associatedMembers = computed(() => this.membersByAssociation('ASSOCIATED'));

  protected readonly domaines = computed(() => (this.lab()?.domainesRecherche ?? []).map((item) => item.name ?? '').filter(Boolean));
  protected readonly axes = computed(() => (this.lab()?.axesRecherche ?? []).map((item) => item.title ?? '').filter(Boolean));
  protected readonly teams = computed(() => (this.lab()?.equipes ?? []).map((item) => item.name ?? '').filter(Boolean));
  protected readonly committee = computed(() => (this.lab()?.comiteGestion ?? [])
    .map((member) => `${member.nomEnseignant ?? 'Membre'}${member.roleComite ? ` — ${member.roleComite}` : ''}`)
    .filter(Boolean));

  protected memberLabel(member: MemberDTO): string {
    const fullName = `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim();
    if (!member.grade) {
      return fullName;
    }

    return `${fullName} (${member.grade})`;
  }

  private membersByAssociation(type: AssociationType): string[] {
    return (this.lab()?.members ?? [])
      .filter((member) => member.associationType === type)
      .map((member) => this.memberLabel(member))
      .filter(Boolean);
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
