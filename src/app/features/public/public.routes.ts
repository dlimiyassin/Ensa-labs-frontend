import { Routes } from '@angular/router';
import { Actualites } from './accueil/actualites/actualites';
import { Chiffres } from './accueil/chiffres/chiffres';
import { Presentation } from './accueil/presentation/presentation';
import { Brevets } from './innovation/brevets/brevets';
import { PartenariatsIndustriels } from './innovation/partenariats/partenariats';
import { ProjetsInnovation } from './innovation/projets/projets';
import { Transfert } from './innovation/transfert/transfert';
import { Equipe } from './laboratoires/equipe/equipe';
import { Equipements } from './laboratoires/equipements/equipements';
import { LabPresentation } from './laboratoires/lab-presentation/lab-presentation';
import { ProjetsLaboratoire } from './laboratoires/projets/projets';
import { Publications } from './laboratoires/publications/publications';
import { Services } from './plateformes/services/services';
import { Technologiques } from './plateformes/technologiques/technologiques';
import { Axes } from './recherche/axes/axes';
import { Partenariats } from './recherche/partenariats/partenariats';
import { ProjetsRecherche } from './recherche/projets/projets';
import { Structures } from './recherche/structures/structures';

export const PUBLIC_ROUTES: Routes = [

  { path: '', redirectTo: 'accueil/presentation', pathMatch: 'full' },

  {
    path: 'accueil',
    children: [
      { path: 'presentation', component: Presentation },
      { path: 'chiffres', component: Chiffres },
      { path: 'actualites', component: Actualites }
    ]
  },

  {
    path: 'laboratoires/:code',
    children: [
      { path: '', component: LabPresentation },
      { path: 'equipe', component: Equipe },
      { path: 'projets', component: ProjetsLaboratoire },
      { path: 'publications', component: Publications },
      { path: 'equipements', component: Equipements }
    ]
  },

  {
    path: 'recherche',
    children: [
      { path: 'axes', component: Axes },
      { path: 'structures', component: Structures },
      { path: 'projets', component: ProjetsRecherche },
      { path: 'partenariats', component: Partenariats }
    ]
  },

  {
    path: 'innovation',
    children: [
      { path: 'brevets', component: Brevets },
      { path: 'projets', component: ProjetsInnovation },
      { path: 'transfert', component: Transfert },
      { path: 'partenariats', component: PartenariatsIndustriels }
    ]
  },

  {
    path: 'plateformes',
    children: [
      { path: 'technologiques', component: Technologiques },
      { path: 'services', component: Services }
    ]
  }
];