import { Injectable, computed, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class HeroLayoutModeService {
  private readonly router = inject(Router);

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

  private normalizePath(path: string): string {
    const [pathname] = path.split(/[?#]/);
    return pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname;
  }
}