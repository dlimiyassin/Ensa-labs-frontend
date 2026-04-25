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
    children: [{ path: '', component: LabPresentation }]
  },
  {
    path: 'production/:tab/:code',
    component: Productions
  },
  {
    path: 'production/:tab',
    component: Productions
  },
  {
    path: 'production',
    redirectTo: 'production/publications/LaRESI',
    pathMatch: 'full'
  },
  {
    path: 'ressources',
    children: [
      { path: 'equipements', component: Equipements },
      { path: 'competences', component: Competences }
    ]
  },
  {
    path: 'partenariats',
    children: [
      { path: '', component: Partenariats },
      { path: 'industriels', component: PartenariatsIndustriels }
    ]
  }
];
