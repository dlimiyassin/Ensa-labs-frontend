import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  signal
} from '@angular/core';

import { ViewportAnimateDirective } from '../../../../shared/animations/viewport-animate.directive';
import { HeroCarouselComponent } from './hero-carousel/hero-carousel';
import {
  ProjectCardComponent,
  type ProjectCardModel
} from './components/project-card/project-card';
import { type GlobalAnimationName } from '../../../../shared/animations/animations';

interface KeyFigureModel {
  readonly label: string;
  readonly value: number;
}

interface ResearchAxisModel {
  readonly title: string;
  readonly description: string;
}

interface LaboratorySectionModel {
  readonly name: string;
  readonly domain: string;
  readonly description: string;
  readonly image: string;
  readonly enterAnimation: GlobalAnimationName;
  readonly leaveAnimation: GlobalAnimationName;
}

@Component({
  selector: 'app-presentation',
  imports: [
    HeroCarouselComponent,
    ViewportAnimateDirective,
    ProjectCardComponent
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
  protected readonly animatedFigureValues = signal<Record<string, number>>({});

  protected readonly labs: readonly LaboratorySectionModel[] = [
    {
      name: 'LRSTA',
      domain: 'Technologies Avancées et Systèmes Intelligents',
      description:
        'Le Laboratoire de Recherche en Sciences et Technologies Avancées (LRSTA) développe des travaux de fond sur l’intelligence artificielle, la modélisation des systèmes complexes et l’exploitation de données à grande échelle. Ses équipes articulent recherche fondamentale et expérimentations appliquées autour de problématiques liées à la santé, à l’industrie et à la transformation numérique des territoires. Le laboratoire valorise une production scientifique rigoureuse, soutenue par des collaborations doctorales, des publications indexées et des partenariats académiques internationaux structurants. Les projets conduits au sein du LRSTA contribuent à la diffusion de connaissances robustes, transférables vers les acteurs publics et socio-économiques.',
      image: 'images/labs/lab1.jpg',
      enterAnimation: 'softSlideRight',
      leaveAnimation: 'softSlideOutRight'
    },
    {
      name: 'LaRESI',
      domain: 'Ingénierie Durable et Innovation Interdisciplinaire',
      description:
        'Le Laboratoire de Recherche en Énergies, Systèmes et Innovation (LaRESI) inscrit ses activités dans une perspective de transition durable, d’optimisation des infrastructures et d’ingénierie au service des besoins sociétaux. Les équipes développent des approches interdisciplinaires associant sciences de l’ingénieur, évaluation environnementale et dispositifs technologiques orientés vers l’impact territorial. La dynamique scientifique repose sur des protocoles méthodologiques exigeants, un ancrage institutionnel fort et une coopération régulière avec les partenaires industriels et institutionnels. À travers ses programmes de recherche, LaRESI consolide le lien entre production académique, innovation responsable et transfert de solutions vers l’écosystème régional.',
      image: 'images/labs/lab2.jpg',
      enterAnimation: 'softSlideLeft',
      leaveAnimation: 'softSlideOutLeft'
    }
  ];

  protected readonly keyFigures: readonly KeyFigureModel[] = [
    { label: 'Projets en cours', value: 28 },
    { label: 'Chercheurs actifs', value: 96 },
    { label: 'Publications récentes', value: 214 },
    { label: 'Partenariats académiques', value: 37 }
  ];

  protected readonly researchAxes: readonly ResearchAxisModel[] = [
    {
      title: 'Intelligence artificielle et science des données',
      description: 'Modèles prédictifs, vision par ordinateur et aide à la décision pour des usages scientifiques et industriels.'
    },
    {
      title: 'Énergie, environnement et durabilité',
      description: 'Optimisation énergétique, évaluation environnementale et solutions technologiques pour la transition durable.'
    },
    {
      title: 'Systèmes embarqués et IoT',
      description: 'Conception de plateformes connectées, sûres et performantes pour l’industrie, la santé et les villes intelligentes.'
    },
    {
      title: 'Ingénierie numérique et innovation pédagogique',
      description: 'Développement d’outils numériques pour renforcer l’enseignement, la simulation et le transfert de connaissance.'
    }
  ];

  protected readonly featuredProjects: readonly ProjectCardModel[] = [
    {
      title: 'Plateforme IA pour l’analyse territoriale',
      description: 'Exploitation de données multi-sources pour appuyer la planification locale et l’anticipation des risques.',
      laboratory: 'LRSTA',
      image: 'images/projects/p1.jpg'
    },
    {
      title: 'Smart Grid Campus',
      description: 'Pilotage intelligent de la consommation électrique universitaire avec tableaux de bord en temps réel.',
      laboratory: 'LaRESI',
      image: 'images/projects/p2.jpg'
    },
    {
      title: 'Observatoire des publications scientifiques',
      description: 'Outil de suivi bibliométrique pour renforcer la visibilité des équipes et structurer les collaborations.',
      laboratory: 'LRSTA',
      image: 'images/projects/p3.jpg'
    },
    {
      title: 'Fabrique de prototypes durables',
      description: 'Accompagnement de projets de recherche appliquée vers des solutions transférables au tissu socio-économique.',
      laboratory: 'LaRESI',
      image: 'images/projects/p4.jpg'
    }
  ];

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
    const startedAt = performance.now();
    const maxValue = Math.max(...this.keyFigures.map((figure) => figure.value), 1);
    const durationMs = Math.min(2000, Math.max(1000, maxValue * 7));

    const animate = (timestamp: number): void => {
      const elapsed = timestamp - startedAt;
      const progress = Math.min(elapsed / durationMs, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      const nextValues = this.keyFigures.reduce<Record<string, number>>((acc, figure) => {
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
}
