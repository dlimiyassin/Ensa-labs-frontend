import { AppRole } from '../../../core/models/api.models';

export interface AdminNavItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
  /** Roles allowed to see the entry; empty = every signed-in user. */
  readonly roles: readonly AppRole[];
}

const MANAGERS: AppRole[] = ['ROLE_SUPER_ADMIN', 'ROLE_LAB_DIRECTOR'];
const PRODUCTION_EDITORS: AppRole[] = ['ROLE_SUPER_ADMIN', 'ROLE_LAB_DIRECTOR', 'ROLE_TEAM_LEADER'];
const SUPER_ADMIN: AppRole[] = ['ROLE_SUPER_ADMIN'];

export const ADMIN_NAV_SECTIONS: readonly { title: string; items: readonly AdminNavItem[] }[] = [
  {
    title: 'Général',
    items: [{ label: 'Tableau de bord', icon: 'pi pi-home', route: '/private', roles: [] }]
  },
  {
    title: 'Structure',
    items: [
      { label: 'Laboratoires', icon: 'pi pi-building', route: '/private/laboratoires', roles: MANAGERS },
      { label: 'Équipes', icon: 'pi pi-sitemap', route: '/private/equipes', roles: MANAGERS },
      { label: 'Membres', icon: 'pi pi-users', route: '/private/membres', roles: MANAGERS }
    ]
  },
  {
    title: 'Production scientifique',
    items: [
      { label: 'Publications', icon: 'pi pi-book', route: '/private/publications', roles: [] },
      { label: 'Thèses', icon: 'pi pi-graduation-cap', route: '/private/theses', roles: PRODUCTION_EDITORS }
    ]
  },
  {
    title: 'Ouverture',
    items: [
      { label: 'Collaborations', icon: 'pi pi-globe', route: '/private/collaborations', roles: MANAGERS },
      { label: 'Ressources', icon: 'pi pi-box', route: '/private/ressources', roles: MANAGERS }
    ]
  },
  {
    title: 'Administration',
    items: [
      { label: 'Thématiques', icon: 'pi pi-tags', route: '/private/thematiques', roles: SUPER_ADMIN },
      { label: 'Utilisateurs', icon: 'pi pi-id-card', route: '/private/utilisateurs', roles: SUPER_ADMIN },
      { label: 'Mon compte', icon: 'pi pi-user', route: '/private/compte', roles: [] }
    ]
  }
];

export const ROUTE_ROLES = { MANAGERS, PRODUCTION_EDITORS, SUPER_ADMIN };
