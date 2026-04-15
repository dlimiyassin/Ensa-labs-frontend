import { Component, HostListener, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppFooter } from './app.footer';
import { AppNavbar } from './app.navbar';
import { AppTopbar } from './app.topbar';
import { LayoutViewportService } from './service/layout-viewport.service';

@Component({
  selector: 'layout-page',
  standalone: true,
  imports: [RouterModule, AppFooter, AppNavbar, AppTopbar],
  template: `
    <div class="layout-wrapper" [class.hero-active]="isHeroActive()">
      <app-topbar class="layout-topbar" />
      <app-navbar class="layout-navbar" />

      <div class="layout-main font-content">
        <router-outlet></router-outlet>
      </div>

      <app-footer class="layout-footer" />
    </div>
  `
})
export class LayoutPage {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly layoutViewport = inject(LayoutViewportService);

  protected readonly isHeroActive = this.layoutViewport.isHeroMergedRoute;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.layoutViewport.updateScrollPosition(window.scrollY);
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.layoutViewport.updateScrollPosition(window.scrollY);
  }
}
