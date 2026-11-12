import { Component, inject } from '@angular/core';
import { LabDirectoryService } from '../core/services/lab-directory.service';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-footer',
  imports: [RouterModule],
  template: `
<footer class="site-footer">
  <div class="footer-glow" aria-hidden="true"></div>

  <div class="footer-inner">

    <!-- Brand column -->
    <div class="footer-brand">
      <div class="footer-logo-wrap">
        <!-- <span class="footer-logo-dot" aria-hidden="true"></span> -->
        <span class="footer-logo">
          <img src="images/logo.png" alt="RechercheUni" width="180" height="32" />
        </span>
      </div>
      <p class="footer-tagline">
        Plateforme de gestion de la recherche scientifique et de l'innovation universitaire.
      </p>
      <div class="footer-labs">
        @for (lab of labs(); track lab.acronym) {
          <span class="footer-lab-badge">{{ lab.acronym }}</span>
        }
      </div>
    </div>

    <!-- Nav columns -->
    <nav class="footer-links" aria-label="Liens du pied de page">

<div class="footer-col">
  <span class="footer-col-title">Accueil</span>
  <a class="footer-link" routerLink="/" fragment="labs">Structures de recherche</a>
  <a class="footer-link" routerLink="/" fragment="axes">Domaines de recherche</a>
  <a class="footer-link" routerLink="/production/publications">Publications récentes</a>
</div>

<div class="footer-col">
  <span class="footer-col-title">Laboratoires</span>
  @for (lab of labs(); track lab.acronym) {
    <a class="footer-link" [routerLink]="['/laboratoires', lab.acronym]">{{ lab.acronym }}</a>
  }
  <a class="footer-link" routerLink="/production/publications">Productions scientifiques</a>
</div>

<div class="footer-col">
  <span class="footer-col-title">collaborations</span>
  <a class="footer-link" routerLink="/partenariats">Partenariats de recherche</a>
  <a class="footer-link" routerLink="/partenariats/industriels">Partenariats industriels</a>
</div>

<div class="footer-col">
  <span class="footer-col-title">Ressources</span>
  <a class="footer-link" routerLink="/ressources/equipements">Équipements</a>
  <a class="footer-link" routerLink="/ressources/competences">Compétences</a>
</div>
    </nav>

  </div>

  <!-- Bottom bar -->
  <div class="footer-bottom">
    <span class="footer-copy">© {{ year }} Tous droits réservés.</span>
    <div class="footer-bottom-divider" aria-hidden="true"></div>
    <span class="footer-bottom-sub">Plateforme de Recherche Universitaire - ENSA BENI MELLAL</span>
    <div class="footer-bottom-divider" aria-hidden="true"></div>
    <span class="footer-copy">Developpé par DLIMI YASSINE</span>
  </div>

</footer>
  `
})
export class AppFooter {
  protected readonly labs = inject(LabDirectoryService).labs;
  readonly year = new Date().getFullYear();
}
