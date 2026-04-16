import { Component } from '@angular/core';

import { ViewportAnimateDirective } from '../../../../shared/animations/viewport-animate.directive';
import { HeroCarouselComponent } from './hero-carousel/hero-carousel';
import { LabCardComponent, type LabCardModel } from './components/lab-card/lab-card';
import {
  ProjectCardComponent,
  type ProjectCardModel
} from './components/project-card/project-card';

interface KeyFigureModel {
  readonly label: string;
  readonly value: string;
}

interface ResearchAxisModel {
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'app-presentation',
  imports: [
    HeroCarouselComponent,
    ViewportAnimateDirective,
    LabCardComponent,
    ProjectCardComponent
  ],
  templateUrl: './presentation.html',
  styleUrl: './presentation.css'
})
export class Presentation {
  protected readonly labs: readonly LabCardModel[] = [
    {
      name: 'LRSTA',
      description:
        'Laboratoire orienté vers les systèmes intelligents, l’analyse des données et les technologies appliquées aux enjeux sociétaux.',
      ctaLabel: 'Voir le laboratoire',
      image: 'images/labs/innovation.jpg'
    },
    {
      name: 'LaRESI',
      description:
        'Laboratoire centré sur l’ingénierie des systèmes, l’innovation durable et la recherche interdisciplinaire à fort impact régional.',
      ctaLabel: 'Voir le laboratoire',
      image: 'images/labs/innovation.jpg'
    }
  ];

  protected readonly keyFigures: readonly KeyFigureModel[] = [
    { label: 'Projets en cours', value: '28' },
    { label: 'Chercheurs actifs', value: '96' },
    { label: 'Publications récentes', value: '214' },
    { label: 'Partenariats académiques', value: '37' }
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
      image: 'images/labs/innovation.jpg'
    },
    {
      title: 'Smart Grid Campus',
      description: 'Pilotage intelligent de la consommation électrique universitaire avec tableaux de bord en temps réel.',
      laboratory: 'LaRESI',
      image: 'images/labs/innovation.jpg'
    },
    {
      title: 'Observatoire des publications scientifiques',
      description: 'Outil de suivi bibliométrique pour renforcer la visibilité des équipes et structurer les collaborations.',
      laboratory: 'LRSTA',
      image: 'images/labs/innovation.jpg'
    },
    {
      title: 'Fabrique de prototypes durables',
      description: 'Accompagnement de projets de recherche appliquée vers des solutions transférables au tissu socio-économique.',
      laboratory: 'LaRESI',
      image: 'images/labs/innovation.jpg'
    }
  ];
}
