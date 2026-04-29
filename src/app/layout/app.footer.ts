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
        <span class="footer-col-title">Accueil</span>
        <a class="footer-link" routerLink="/" fragment="labs">Structures de recherche</a>
        <a class="footer-link" routerLink="/" fragment="axes">Domaines de recherche</a>
        <a class="footer-link" routerLink="/" fragment="publications">Publications récentes</a>
      </div>

      <div class="footer-col">
        <span class="footer-col-title">Laboratoires</span>
        <a class="footer-link" routerLink="/laboratoires/LRSTA">LRSTA</a>
        <a class="footer-link" routerLink="/laboratoires/LaRESI">LaRESI</a>
        <a class="footer-link" routerLink="/production/LaRESI">Productions scientifiques</a>
      </div>

      <div class="footer-col">
        <span class="footer-col-title">Ressources & collaborations</span>
        <a class="footer-link" routerLink="/ressources/equipements">Équipements</a>
        <a class="footer-link" routerLink="/ressources/competences">Compétences</a>
        <a class="footer-link" routerLink="/partenariats">Partenariats de recherche</a>
        <a class="footer-link" routerLink="/partenariats/industriels">Partenariats industriels</a>
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
