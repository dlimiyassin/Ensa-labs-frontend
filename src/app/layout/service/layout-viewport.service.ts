import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LayoutViewportService {
  private readonly router = inject(Router);

  private readonly scrollY = signal(0);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url)
    ),
    { initialValue: this.router.url }
  );

  readonly isHeroMergedRoute = computed(() =>
    this.normalizePath(this.currentUrl()) === '/accueil/presentation'
  );

  readonly isAtPageTop = computed(() => this.scrollY() <= 0);

  readonly isNavbarTransparent = computed(() => this.isAtPageTop());

  readonly isNavbarSolid = computed(() => !this.isAtPageTop());

  updateScrollPosition(scrollPosition: number): void {
    this.scrollY.set(Math.max(0, scrollPosition));
  }

  private normalizePath(path: string): string {
    const [pathname] = path.split(/[?#]/);
    return pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  }
}
