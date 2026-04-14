import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  styles: [],
  template: `
    <nav class="layout-navbar">

      <!-- Mobile toggle -->
      <button class="mobile-toggle" (click)="toggleMenu()">
        <i class="pi pi-bars"></i>
      </button>

      <!-- Logo -->
      <a class="layout-navbar-logo-container" routerLink="/">
        <img src="images/logo.png" alt="Logo" class="logo-img"/>
      </a>

      <div class="nav-menu" [class.open]="isMobileOpen">


        <!-- Dynamic menu -->
        @for (item of navItems; track item.title) {
          <div class="nav-item">

            <div class="nav-link">
              <p>{{ item.title }}</p>
              <span class="chevron">
                <i class="pi pi-sort-down-fill text-xs!"></i>
              </span>
            </div>

            <div class="dropdown">

              @for (section of item.sections; track section.label) {

                <!-- Normal links -->
                @if (section.links) {
                  @for (link of section.links; track link.label) {
                    <a
                      [routerLink]="link.route"
                      [style.fontWeight]="link.bold ? '500' : 'normal'"
                    >
                      {{ link.label }}
                    </a>
                  }
                }

                <!-- Sub section -->
                @if (section.subLabel) {
                  <div class="dropdown-label">
                    {{ section.subLabel }}
                  </div>
                }

                @if (section.subLinks) {
                  <div class="dropdown-sub">
                    @for (link of section.subLinks; track link.label) {
                      <a [routerLink]="link.route">
                        {{ link.label }}
                      </a>
                    }
                  </div>
                }

              }

            </div>
          </div>
        }

      </div>

      <div class="flex flex-row items-center gap-2">
        <button class="cursor-pointer rounded py-2 px-4 hover:bg-gray-200" title="login" routerLink="private-backdoor-7">Admin</button>
      </div>

    </nav>
  `
})
export class AppNavbar {

  isMobileOpen = false;

  toggleMenu() {
    this.isMobileOpen = !this.isMobileOpen;
  }

  navItems: NavItem[] = [
    {
      title: 'Accueil',
      sections: [
        {
          label: 'main',
          links: [
            { label: 'Présentation générale', route: '/accueil/presentation' },
            { label: 'Chiffres clés', route: '/accueil/chiffres' },
            { label: 'Actualités récentes', route: '/accueil/actualites' }
          ]
        }
      ]
    },
    {
      title: 'Laboratoires',
      sections: [
        {
          label: 'LRSTA',
          subLabel: "Technologies Avancées",
          subLinks: [
            { label: 'LRSTA', route: '/laboratoires/LRSTA' },
          ]
        },
        {
          label: 'LaRESI',
          subLabel: "Ingénierie et Innovation",
          subLinks: [
            { label: 'LaRESI', route: '/laboratoires/LaRESI' },
          ]
        }
      ]
    },
    {
      title: 'Recherche',
      sections: [
        {
          label: 'main',
          links: [
            { label: 'Axes de recherche', route: '/recherche/axes' },
            { label: 'Structures de recherche', route: '/recherche/structures' },
            { label: 'Projets de recherche', route: '/recherche/projets' },
            { label: 'Partenariats', route: '/recherche/partenariats' }
          ]
        }
      ]
    },
    {
      title: 'Innovation',
      sections: [
        {
          label: 'main',
          links: [
            { label: 'Brevets', route: '/innovation/brevets' },
            { label: 'Projets innovants', route: '/innovation/projets' },
            { label: 'Transfert de technologie', route: '/innovation/transfert' },
            { label: 'Partenariats industriels', route: '/innovation/partenariats' }
          ]
        }
      ]
    },
    {
      title: 'Plateformes',
      sections: [
        {
          label: 'main',
          links: [
            { label: 'Plateformes technologiques', route: '/plateformes/technologiques' },
            { label: 'Équipements', route: '/plateformes/equipements' },
            { label: 'Services proposés', route: '/plateformes/services' }
          ]
        }
      ]
    }
  ];
}

interface NavLink {
  label?: string;
  route?: string;
  bold?: boolean;
}

interface NavSection {
  label: string;
  links?: NavLink[];
  subLabel?: string;
  subLinks?: NavLink[];
}

interface NavItem {
  title: string;
  sections: NavSection[];
}
