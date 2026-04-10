import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  styles: [],
  template: `
    <nav class="layout-navbar">

      <!-- Mobile toggle button -->
      <button class="mobile-toggle" (click)="toggleMenu()">
        <i class="pi pi-bars"></i>
      </button>

      <div class="nav-menu" [class.open]="isMobileOpen">

        <!-- Logo -->
        <a class="layout-navbar-logo-container" routerLink="/">
          <img src="images/logo.png" alt="Logo" class="logo-img"/>
        </a>

        <!-- Accueil -->
        <div class="nav-item">
          <div class="nav-link">
            Accueil <span class="chevron"><i class="pi pi-sort-down-fill text-xs!"></i></span>
          </div>
          <div class="dropdown">
            <a routerLink="/accueil/presentation">Présentation générale</a>
            <a routerLink="/accueil/chiffres">Chiffres clés</a>
            <a routerLink="/accueil/actualites">Actualités récentes</a>
          </div>
        </div>

        <!-- Laboratoires -->
        <div class="nav-item">
          <div class="nav-link">
            Laboratoires <span class="chevron"><i class="pi pi-sort-down-fill text-xs!"></i></span>
          </div>
          <div class="dropdown">
            <a routerLink="/laboratoires" style="font-weight: 500;">Liste des laboratoires</a>
            <div class="dropdown-label">Détail d'un laboratoire</div>
            <div class="dropdown-sub">
              <a routerLink="/laboratoires/equipe">Équipe</a>
              <a routerLink="/laboratoires/projets">Projets</a>
              <a routerLink="/laboratoires/publications">Publications</a>
              <a routerLink="/laboratoires/equipements">Équipements</a>
            </div>
          </div>
        </div>

        <!-- Recherche -->
        <div class="nav-item">
          <div class="nav-link">
            Recherche <span class="chevron"><i class="pi pi-sort-down-fill text-xs!"></i></span>
          </div>
          <div class="dropdown">
            <a routerLink="/recherche/axes">Axes de recherche</a>
            <a routerLink="/recherche/structures">Structures de recherche</a>
            <a routerLink="/recherche/projets">Projets de recherche</a>
            <a routerLink="/recherche/partenariats">Partenariats</a>
          </div>
        </div>

        <!-- Innovation -->
        <div class="nav-item">
          <div class="nav-link">
            Innovation & Valorisation <span class="chevron"><i class="pi pi-sort-down-fill text-xs!"></i></span>
          </div>
          <div class="dropdown">
            <a routerLink="/innovation/brevets">Brevets</a>
            <a routerLink="/innovation/projets">Projets innovants</a>
            <a routerLink="/innovation/transfert">Transfert de technologie</a>
            <a routerLink="/innovation/partenariats">Partenariats industriels</a>
          </div>
        </div>

        <!-- Plateformes -->
        <div class="nav-item">
          <div class="nav-link">
            Plateformes & Équipements <span class="chevron"><i class="pi pi-sort-down-fill text-xs!"></i></span>
          </div>
          <div class="dropdown">
            <a routerLink="/plateformes/technologiques">Plateformes technologiques</a>
            <a routerLink="/plateformes/equipements">Équipements</a>
            <a routerLink="/plateformes/services">Services proposés</a>
          </div>
        </div>

      </div>

      <div class="layout-navbar-actions">
        <button class="layout-navbar-action" title="Rechercher"></button>
        <button class="layout-navbar-action" title="Notifications"></button>
        <button class="layout-navbar-action" title="Profil"></button>
      </div>

    </nav>
  `
})
export class AppNavbar {
  isMobileOpen = false;

  toggleMenu() {
    this.isMobileOpen = !this.isMobileOpen;
  }
}