import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AnimateDirective } from '../shared/animations/animate.directive';
import { LayoutViewportService } from './service/layout-viewport.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, AnimateDirective],
  styles: [],
  template: `
    <nav
      class="layout-navbar"
      [class.is-on-hero]="isHeroMergedRoute()"
      [class.is-transparent]="isNavbarTransparent()"
      [class.is-solid]="isNavbarSolid()"
    >
      <button class="mobile-toggle" (click)="toggleMenu()">
        <i class="pi pi-bars"></i>
      </button>

      <a
        class="layout-navbar-logo-container"
        routerLink="/"
        appAnimate="zoomIn"
        [appAnimateDuration]="2000"
        [appAnimateDelay]="200"
      >
        <img src="images/logo.png" alt="Logo" class="logo-img" />
      </a>

      <div class="nav-menu" [class.open]="isMobileOpen">
        @for (item of navItems; track item.title) {
          <div class="nav-item">
            <div
              class="nav-link"
              [class.active]="isItemActive(item)"
              appAnimate="slideLeft"
              [appAnimateDuration]="2000"
              [appAnimateDelay]="200"
            >
              <p>{{ item.title }}</p>
              <span class="chevron">
                <i class="pi pi-chevron-down text-xs!"></i>
              </span>
            </div>

            <div class="dropdown">
              @for (section of item.sections; track section.label) {
                @if (section.links) {
                  @for (link of section.links; track link.label) {
                    <a [routerLink]="link.route" [style.fontWeight]="link.bold ? '500' : 'normal'">
                      {{ link.label }}
                    </a>
                  }
                }

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
        <button class="cursor-pointer rounded py-2 px-4 hover:bg-gray-200" title="login" routerLink="private-backdoor-7">
          Admin
        </button>
      </div>
    </nav>
  `
})
export class AppNavbar {
  isMobileOpen = false;

  private readonly router = inject(Router);
  private readonly layoutViewport = inject(LayoutViewportService);

  protected readonly isHeroMergedRoute = this.layoutViewport.isHeroMergedRoute;
  protected readonly isNavbarTransparent = this.layoutViewport.isNavbarTransparent;
  protected readonly isNavbarSolid = this.layoutViewport.isNavbarSolid;

  isItemActive(item: NavItem): boolean {
    const routes = item.sections.flatMap((section) => [
      ...(section.links ?? []),
      ...(section.subLinks ?? [])
    ]);

    return routes.some(
      (link) =>
        !!link.route &&
        this.router.isActive(link.route, {
          paths: 'subset',
          queryParams: 'ignored',
          matrixParams: 'ignored',
          fragment: 'ignored'
        })
    );
  }

  toggleMenu() {
    this.isMobileOpen = !this.isMobileOpen;
  }

  navItems: NavItem[] = [
    {
      title: 'ACCUEIL',
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
      title: 'LABORATOIRES',
      sections: [
        {
          label: 'LRSTA',
          subLabel: 'Technologies Avancées',
          subLinks: [{ label: 'LRSTA', route: '/laboratoires/LRSTA' }]
        },
        {
          label: 'LaRESI',
          subLabel: 'Ingénierie et Innovation',
          subLinks: [{ label: 'LaRESI', route: '/laboratoires/LaRESI' }]
        }
      ]
    },
    {
      title: 'RECHERCHE',
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
      title: 'INNOVATION',
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
      title: 'PLATEFORMES',
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
