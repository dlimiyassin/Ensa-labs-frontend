import { Component, HostListener, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterModule } from '@angular/router';

import { AppFooter } from './app.footer';
import { AppNavbar } from './app.navbar';
import { AppTopbar } from './app.topbar';
import { LayoutViewportService } from './service/layout-viewport.service';
import { SpinnerComponent } from '../shared/components/public/spinner/spinner';

@Component({
  selector: 'layout-page',
  standalone: true,
  imports: [RouterModule, AppFooter, AppNavbar, AppTopbar, SpinnerComponent],
  template: `
    <div class="layout-wrapper" [class.hero-active]="isHeroActive()">
      <app-topbar class="layout-topbar" />
      <app-navbar class="layout-navbar" />

      <div class="layout-main font-content">
        @if (isNavigating() && !isHomeRoute()) {
          <app-spinner message="Chargement de la page..." />
        }
        <router-outlet></router-outlet>
      </div>

      <app-footer class="layout-footer" />
    </div>
  `
})
export class LayoutPage {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly layoutViewport = inject(LayoutViewportService);
  private readonly router = inject(Router);

  protected readonly isHeroActive = this.layoutViewport.isHeroMergedRoute;
  protected readonly isNavigating = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.layoutViewport.updateScrollPosition(window.scrollY);
    }

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isNavigating.set(true);
      }

      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.isNavigating.set(false);
      }
    });
  }

  protected isHomeRoute(): boolean {
    return this.router.url === '/';
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.layoutViewport.updateScrollPosition(window.scrollY);
  }
}
