import { Routes } from '@angular/router';
import { Brevets } from './innovation/brevets/brevets';
import { PartenariatsIndustriels } from './innovation/partenariats/partenariats';
import { ProjetsInnovation } from './innovation/projets/projets';
import { Transfert } from './innovation/transfert/transfert';
import { Equipements } from './plateformes/equipements/equipements';
import { LabPresentation } from './laboratoires/lab-presentation/lab-presentation';
import { Publications } from './plateformes/publications/publications';
import { Technologiques } from './plateformes/technologiques/technologiques';
import { Partenariats } from './recherche/partenariats/partenariats';
import { ProjetsRecherche } from './recherche/projets/projets';
import { Presentation } from './presentation/presentation';

export const PUBLIC_ROUTES: Routes = [

  {
    path: '',
    component: Presentation
  },

  {
    path: 'laboratoires/:code',
    children: [
      { path: '', component: LabPresentation },
      { path: 'publications', component: Publications }
    ]
  },
  {
    path: 'projets',
    children: [
      { path: 'recherche', component: ProjetsRecherche },
      { path: 'innovation', component: ProjetsInnovation }
    ]
  },
  {
    path: 'innovation',
    children: [
      { path: 'brevets', component: Brevets },
      { path: 'transfert', component: Transfert },
    ]
  },
  {
    path: 'partenariats',
    children: [
      { path: '', component: Partenariats },
      { path: 'industriels', component: PartenariatsIndustriels }
    ]
  },
  {
    path: 'plateformes',
    children: [
      { path: 'publications', component: Publications },
      { path: 'equipements', component: Equipements },
      { path: 'technologiques', component: Technologiques }
    ]
  }
];
