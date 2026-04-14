import { Routes } from '@angular/router';
import { LayoutPage } from './layout/layout-page';
import { Presentation } from './pages/accueil/presentation/presentation';
import { Actualites } from './pages/accueil/actualites/actualites';
import { Chiffres } from './pages/accueil/chiffres/chiffres';
import { Brevets } from './pages/innovation/brevets/brevets';
import { Transfert } from './pages/innovation/transfert/transfert';
import { Equipe } from './pages/laboratoires/equipe/equipe';
import { Equipements } from './pages/laboratoires/equipements/equipements';
import { Publications } from './pages/laboratoires/publications/publications';
import { Services } from './pages/plateformes/services/services';
import { Axes } from './pages/recherche/axes/axes';
import { Partenariats } from './pages/recherche/partenariats/partenariats';
import { Structures } from './pages/recherche/structures/structures';
import { ProjetsRecherche } from './pages/recherche/projets/projets';
import { ProjetsInnovation } from './pages/innovation/projets/projets';
import { ProjetsLaboratoire } from './pages/laboratoires/projets/projets';
import { PartenariatsIndustriels } from './pages/innovation/partenariats/partenariats';
import { Technologiques } from './pages/plateformes/technologiques/technologiques';
import { LabPresentation } from './pages/laboratoires/lab-presentation/lab-presentation';


export const routes: Routes = [
  {
    path: '',
    component: LayoutPage,
    children: [

      // Default redirect
      { path: '', redirectTo: 'accueil/presentation', pathMatch: 'full' },

      // =====================
      // ACCUEIL
      // =====================
      {
        path: 'accueil',
        children: [
          { path: 'presentation', component: Presentation },
          { path: 'chiffres', component: Chiffres },
          { path: 'actualites', component: Actualites }
        ]
      },

      // =====================
      // LABORATOIRES
      // =====================
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

      // =====================
      // RECHERCHE
      // =====================
      {
        path: 'recherche',
        children: [
          { path: 'axes', component: Axes },
          { path: 'structures', component: Structures },
          { path: 'projets', component: ProjetsRecherche },
          { path: 'partenariats', component: Partenariats }
        ]
      },

      // =====================
      // INNOVATION
      // =====================
      {
        path: 'innovation',
        children: [
          { path: 'brevets', component: Brevets },
          { path: 'projets', component: ProjetsInnovation },
          { path: 'transfert', component: Transfert },
          { path: 'partenariats', component: PartenariatsIndustriels }
        ]
      },

      // =====================
      // PLATEFORMES
      // =====================
      {
        path: 'plateformes',
        children: [
          { path: 'technologiques', component: Technologiques },
          { path: 'equipements', component: Equipements },
          { path: 'services', component: Services }
        ]
      }

    ]
  },

  // fallback
  { path: '**', redirectTo: '' }
];