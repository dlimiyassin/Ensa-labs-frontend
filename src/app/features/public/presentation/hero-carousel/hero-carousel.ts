import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AnimateDirective } from '../../../../shared/animations/animate.directive';

type NavigationDirection = 'forward' | 'backward';

interface HeroSlide {
  readonly image: string;
  readonly alt: string;
  readonly title: string;
  readonly subtitle: string;
  readonly ctaLabel: string;
  readonly ctaRoute: string;
}

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [AnimateDirective, RouterModule],
  templateUrl: './hero-carousel.html',
  styleUrl: './hero-carousel.css'
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  readonly slides: readonly HeroSlide[] = [
    {
      image: 'images/home/engineering.jpg',
      alt: 'Laboratoire d\u2019ing\u00e9nierie ENSA',
      title: 'Recherche & ing\u00e9nierie d\u2019excellence',
      subtitle:
        'Des laboratoires universitaires ouverts aux collaborations scientifiques, industrielles et soci\u00e9tales.',
      ctaLabel: 'Explorer les laboratoires',
      ctaRoute: '/laboratoires/LRSTA'
    },
    {
      image: 'images/home/innovation.jpg',
      alt: 'Innovation scientifique ENSA',
      title: 'Innovation au service du territoire',
      subtitle:
        'Une plateforme de recherche multidisciplinaire pour acc\u00e9l\u00e9rer la valorisation et le transfert technologique.',
      ctaLabel: 'D\u00e9couvrir l\u2019innovation',
      ctaRoute: '/innovation/projets'
    }
  ];

  readonly currentIndex = signal(0);
  readonly previousIndex = signal<number | null>(null);
  readonly direction = signal<NavigationDirection>('forward');
  readonly isPaused = signal(false);

  /**
   * Incremented each time a slide becomes active.
   * Used as a @for track key in the template so Angular re-creates the
   * progress span — restarting the CSS animation cleanly from 0.
   */
  readonly progressEpoch = signal(0);

  readonly currentSlide = computed(() => this.slides[this.currentIndex()]);
  readonly previousSlide = computed(() => {
    const index = this.previousIndex();
    return index === null ? null : this.slides[index];
  });

  /** Total visible duration of each slide in ms. */
  readonly autoPlayInterval = 6500;

  private animationResetTimeout: ReturnType<typeof setTimeout> | null = null;
  private autoPlayTimer: ReturnType<typeof setTimeout> | null = null;
  private reducedMotion = false;

  /** Wall-clock timestamp at which the current countdown segment started. */
  private cycleStartedAt: number | null = null;
  /** Ms already consumed in the current slide's cycle before the last pause. */
  private consumedMs = 0;

  ngOnInit(): void {
    this.reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!this.reducedMotion) {
      this.scheduleNext(this.autoPlayInterval);
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
    if (this.animationResetTimeout) {
      clearTimeout(this.animationResetTimeout);
    }
  }

  next(): void {
    const target = (this.currentIndex() + 1) % this.slides.length;
    this.navigateTo(target, 'forward');
  }

  previous(): void {
    const target = (this.currentIndex() - 1 + this.slides.length) % this.slides.length;
    this.navigateTo(target, 'backward');
  }

  goTo(index: number): void {
    if (index === this.currentIndex() || index < 0 || index >= this.slides.length) {
      return;
    }
    const dir: NavigationDirection = index > this.currentIndex() ? 'forward' : 'backward';
    this.navigateTo(index, dir);
  }

  pauseAutoPlay(): void {
    if (this.isPaused() || this.reducedMotion) return;
    this.isPaused.set(true);

    // Snapshot elapsed time so resume can schedule only what's left.
    if (this.cycleStartedAt !== null) {
      this.consumedMs += performance.now() - this.cycleStartedAt;
      this.cycleStartedAt = null;
    }
    this.clearTimer();
  }

  resumeAutoPlay(): void {
    if (!this.isPaused() || this.reducedMotion) return;
    this.isPaused.set(false);

    const remaining = Math.max(0, this.autoPlayInterval - this.consumedMs);
    this.scheduleNext(remaining);
  }

  /**
   * CSS animation-duration for the active dot's progress bar.
   * On a fresh slide: full interval. After a resume: only what remains.
   * The template re-creates the span on each epoch change, so the animation
   * always starts at scaleX(0) and runs exactly `progressBarDuration` ms.
   */
  get progressBarDuration(): string {
    const remaining = Math.max(0, this.autoPlayInterval - this.consumedMs);
    return `${remaining}ms`;
  }

  protected trackByIndex(index: number): number {
    return index;
  }

  private navigateTo(index: number, direction: NavigationDirection): void {
    this.direction.set(direction);
    this.previousIndex.set(this.currentIndex());
    this.currentIndex.set(index);

    // New slide — reset the progress state entirely.
    this.consumedMs = 0;
    this.progressEpoch.update(e => e + 1);

    if (!this.reducedMotion && !this.isPaused()) {
      this.clearTimer();
      this.scheduleNext(this.autoPlayInterval);
    }

    if (this.animationResetTimeout) {
      clearTimeout(this.animationResetTimeout);
    }
    this.animationResetTimeout = setTimeout(() => {
      this.previousIndex.set(null);
      this.animationResetTimeout = null;
    }, 620);
  }

  private scheduleNext(delay: number): void {
    this.cycleStartedAt = performance.now();
    this.autoPlayTimer = setTimeout(() => {
      this.autoPlayTimer = null;
      this.cycleStartedAt = null;
      this.consumedMs = 0;
      this.next();
    }, delay);
  }

  private clearTimer(): void {
    if (this.autoPlayTimer !== null) {
      clearTimeout(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }
}