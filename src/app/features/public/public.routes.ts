import { Routes } from '@angular/router';
import { Presentation } from './presentation/presentation';
import { LabPresentation } from './laboratoires/lab-presentation/lab-presentation';
import { Productions } from './productions/productions';
import { Equipements } from './ressources/equipements/equipements';
import { Competences } from './ressources/competences/competences';
import { PartenariatsIndustriels } from './colaborations/partenariats-industriels/partenariats';
import { Partenariats } from './colaborations/partenariats/partenariats';

export const PUBLIC_ROUTES: Routes = [

  {
    path: '',
    component: Presentation
  },

  {
    path: 'laboratoires/:code',
    children: [
      { path: '', component: LabPresentation }
    ]
  },

  // Production: /production/publications|communications|theses open that tab of the first lab
  { path: 'production', redirectTo: 'production/publications', pathMatch: 'full' },

  // Production (global)
  {
    path: 'production/:code',
    component: Productions
  },

  // Resources (global)
  {
    path: 'ressources',
    children: [
      { path: 'equipements', component: Equipements },
      { path: 'competences', component: Competences }
    ]
  },

  // Partenariats (global)
  {
    path: 'partenariats',
    children: [
      { path: '', component: Partenariats },
      { path: 'industriels', component: PartenariatsIndustriels }
    ]
  }

];
