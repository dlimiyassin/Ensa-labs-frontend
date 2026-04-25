import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
  ViewChild
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

import { HeroCarouselComponent } from './hero-carousel/hero-carousel';
import { GlobalAnimationName } from '../../../shared/animations/animations';
import { ViewportAnimateDirective } from '../../../shared/animations/viewport-animate.directive';
import { LabsService } from '../../../core/services/labs.service';
import { PublicationsService } from '../../../core/services/publications.service';
import { AxeRechercheDTO, LabDTO, PublicationDTO } from '../../../core/models/api.models';
import { SectionLinkComponent } from '../../../shared/components/public/section-link/section-link';

interface KeyFigureModel {
  readonly label: string;
  readonly value: number;
}

interface ResearchAxisModel {
  readonly title: string;
  readonly description: string;
  readonly labCode: string;
}

interface LaboratorySectionModel {
  readonly name: string;
  readonly domain: string;
  readonly description: string;
  readonly image: string;
  readonly enterAnimation: GlobalAnimationName;
  readonly leaveAnimation: GlobalAnimationName;
}

interface PublicationHighlightModel {
  readonly id: string;
  readonly title: string;
  readonly year: number | null;
  readonly meta: string;
}

@Component({
  selector: 'app-presentation',
  imports: [
    HeroCarouselComponent,
    ViewportAnimateDirective,
    RouterLink,
    SectionLinkComponent
  ],
  templateUrl: './presentation.html',
  styleUrl: './presentation.css'
})
export class Presentation implements AfterViewInit, OnDestroy {
  @ViewChild('keyFiguresSection')
  private keyFiguresSection?: ElementRef<HTMLElement>;

  private keyFiguresObserver?: IntersectionObserver;
  private hasAnimatedFigures = false;
  private counterFrameId: number | null = null;

  private readonly labsService = inject(LabsService);
  private readonly publicationsService = inject(PublicationsService);

  protected readonly animatedFigureValues = signal<Record<string, number>>({});
  protected readonly dataError = signal('');

  private readonly labsData = toSignal(
    this.labsService.findAll().pipe(
      catchError(() => {
        this.dataError.set('Certaines données n’ont pas pu être chargées.');
        return of<LabDTO[]>([]);
      })
    ),
    { initialValue: [] }
  );

  private readonly publicationsData = toSignal(
    this.publicationsService.findAll().pipe(
      catchError(() => {
        this.dataError.set('Certaines données n’ont pas pu être chargées.');
        return of<PublicationDTO[]>([]);
      })
    ),
    { initialValue: [] }
  );

  protected readonly labs = computed<readonly LaboratorySectionModel[]>(() => {
    const data = this.labsData();
    return data.slice(0, 2).map((lab, index) => ({
      name: this.resolveLabCode(lab, index),
      domain: (lab.titleFr ?? lab.titleEn ?? 'Structure de recherche').trim(),
      description: this.buildLabDescription(lab),
      image: this.resolveLabImage(lab.acronym, index),
      enterAnimation: index % 2 === 0 ? 'softSlideRight' : 'softSlideLeft',
      leaveAnimation: index % 2 === 0 ? 'softSlideOutRight' : 'softSlideOutLeft'
    }));
  });

  protected readonly keyFigures = computed<readonly KeyFigureModel[]>(() => {
    const labs = this.labsData();
    const publications = this.publicationsData();
    const researchers = labs.reduce((sum, lab) => sum + (lab.members?.length ?? 0), 0);
    const axes = labs.reduce((sum, lab) => sum + (lab.axesRecherche?.length ?? 0), 0);

    return [
      { label: 'Laboratoires actifs', value: labs.length },
      { label: 'Chercheurs actifs', value: researchers },
      { label: 'Publications indexées', value: publications.length },
      { label: 'Axes de recherche', value: axes }
    ];
  });

  protected readonly researchAxes = computed<readonly ResearchAxisModel[]>(() => {
    const flattened = this.labsData()
      .flatMap((lab, index) => (lab.axesRecherche ?? []).map((axis) => ({ axis, labCode: this.resolveLabCode(lab, index) })))
      .filter(({ axis }) => !!axis.title)
      .slice(0, 4);

    return flattened.map(({ axis, labCode }) => this.toResearchAxis(axis, labCode));
  });

  protected readonly latestPublications = computed<readonly PublicationHighlightModel[]>(() => {
    return [...this.publicationsData()]
      .sort((a, b) => (b.publicationYear ?? 0) - (a.publicationYear ?? 0))
      .slice(0, 5)
      .map((item) => ({
        id: item.id ?? `${item.title ?? 'publication'}-${item.publicationYear ?? 'na'}`,
        title: (item.title ?? 'Sans titre').trim(),
        year: item.publicationYear ?? null,
        meta: (item.journal ?? item.conference ?? 'Publication scientifique').trim()
      }));
  });

  ngAfterViewInit(): void {
    const keyFiguresElement = this.keyFiguresSection?.nativeElement;
    if (!keyFiguresElement || typeof IntersectionObserver === 'undefined') {
      this.startKeyFiguresAnimation();
      return;
    }

    this.keyFiguresObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || this.hasAnimatedFigures) {
            continue;
          }

          this.startKeyFiguresAnimation();
          this.keyFiguresObserver?.disconnect();
          break;
        }
      },
      { threshold: 0.35 }
    );

    this.keyFiguresObserver.observe(keyFiguresElement);
  }

  ngOnDestroy(): void {
    this.keyFiguresObserver?.disconnect();
    if (this.counterFrameId !== null) {
      cancelAnimationFrame(this.counterFrameId);
      this.counterFrameId = null;
    }
  }

  protected getAnimatedFigureValue(figure: KeyFigureModel): string {
    const animatedValue = this.animatedFigureValues()[figure.label];
    const value = typeof animatedValue === 'number' ? animatedValue : 0;
    return value.toLocaleString('fr-FR');
  }

  private startKeyFiguresAnimation(): void {
    if (this.hasAnimatedFigures) {
      return;
    }

    this.hasAnimatedFigures = true;
    const figures = this.keyFigures();
    const startedAt = performance.now();
    const maxValue = Math.max(...figures.map((figure) => figure.value), 1);
    const durationMs = Math.min(2000, Math.max(1000, maxValue * 7));

    const animate = (timestamp: number): void => {
      const elapsed = timestamp - startedAt;
      const progress = Math.min(elapsed / durationMs, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      const nextValues = figures.reduce<Record<string, number>>((acc, figure) => {
        acc[figure.label] = Math.round(figure.value * easedProgress);
        return acc;
      }, {});

      this.animatedFigureValues.set(nextValues);

      if (progress < 1) {
        this.counterFrameId = requestAnimationFrame(animate);
      } else {
        this.counterFrameId = null;
      }
    };

    this.counterFrameId = requestAnimationFrame(animate);
  }

  private buildLabDescription(lab: LabDTO): string {
    const title = lab.titleFr ?? lab.titleEn ?? lab.acronym ?? 'Ce laboratoire';
    const university = lab.university ? `rattaché à ${lab.university}` : 'inscrit dans un écosystème académique structurant';
    const program = lab.program ? `Le programme ${lab.program} encadre ses priorités scientifiques.` : '';

    return `${title} est ${university}. ${program}`.trim();
  }

  private toResearchAxis(axis: AxeRechercheDTO, labCode: string): ResearchAxisModel {
    return {
      title: (axis.title ?? 'Axe de recherche').trim(),
      description: `Axe porté par le laboratoire ${labCode}.`,
      labCode
    };
  }



  private resolveLabCode(lab: LabDTO, index: number): string {
    return (lab.code ?? lab.acronym ?? `LAB-${index + 1}`).trim();
  }
  private resolveLabImage(acronym: string | undefined, index: number): string {
    if (acronym === 'LRSTA') return 'images/labs/lab1.jpg';
    if (acronym === 'LaRESI') return 'images/labs/lab2.jpg';
    return index % 2 === 0 ? 'images/labs/lab1.jpg' : 'images/labs/lab2.jpg';
  }
}
