import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-footer',
  template: `
    <footer>
      <div class="footer-inner">

        <div class="footer-brand">
          <span class="footer-logo">RechercheUni</span>
          <p>Plateforme de gestion de la recherche scientifique et de l'innovation universitaire.</p>
        </div>

        <div class="footer-links">

          <div class="footer-col">
            <span class="footer-col-title">Recherche</span>
            <a href="#">Axes de recherche</a>
            <a href="#">Projets</a>
            <a href="#">Partenariats</a>
          </div>

          <div class="footer-col">
            <span class="footer-col-title">Laboratoires</span>
            <a href="#">Liste des labos</a>
            <a href="#">Équipes</a>
            <a href="#">Publications</a>
          </div>

          <div class="footer-col">
            <span class="footer-col-title">Innovation</span>
            <a href="#">Brevets</a>
            <a href="#">Transfert technologique</a>
            <a href="#">Partenariats industriels</a>
          </div>

        </div>

      </div>

      <div class="footer-bottom">
        <span>© {{ year }} RechercheUni. Tous droits réservés.</span>
      </div>
    </footer>
  `
})
export class AppFooter {
  year = new Date().getFullYear();
}