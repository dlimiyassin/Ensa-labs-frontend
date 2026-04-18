import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-footer',
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
        <span class="footer-lab-badge">LRSTA</span>
        <span class="footer-lab-badge">LaRESI</span>
      </div>
    </div>

    <!-- Nav columns -->
    <nav class="footer-links" aria-label="Liens du pied de page">

      <div class="footer-col">
        <span class="footer-col-title">Recherche</span>
        <a class="footer-link" routerLink="/recherche/axes">Axes de recherche</a>
        <a class="footer-link" routerLink="/recherche/projets">Projets</a>
        <a class="footer-link" routerLink="/recherche/partenariats">Partenariats</a>
      </div>

      <div class="footer-col">
        <span class="footer-col-title">Laboratoires</span>
        <a class="footer-link" routerLink="/laboratoires">Liste des labos</a>
        <a class="footer-link" routerLink="/laboratoires/equipes">Équipes</a>
        <a class="footer-link" routerLink="/laboratoires/publications">Publications</a>
      </div>

      <div class="footer-col">
        <span class="footer-col-title">Innovation</span>
        <a class="footer-link" routerLink="/innovation/brevets">Brevets</a>
        <a class="footer-link" routerLink="/innovation/transfert">Transfert technologique</a>
        <a class="footer-link" routerLink="/innovation/partenariats">Partenariats industriels</a>
      </div>

    </nav>

  </div>

  <!-- Bottom bar -->
  <div class="footer-bottom">
    <span class="footer-copy">© {{ year }} RechercheUni. Tous droits réservés.</span>
    <div class="footer-bottom-divider" aria-hidden="true"></div>
    <span class="footer-bottom-sub">Plateforme académique — Usage institutionnel</span>
  </div>

</footer>
  `
})
export class AppFooter {
  readonly year = new Date().getFullYear();
}