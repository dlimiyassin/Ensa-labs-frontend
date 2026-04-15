import { Component, OnDestroy, computed, signal } from '@angular/core';
import { AnimateDirective } from '../../../../../shared/animations/animate.directive';

type NavigationDirection = 'forward' | 'backward';

interface HeroSlide {
  readonly image: string;
  readonly alt: string;
  readonly title: string;
  readonly subtitle: string;
}

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [AnimateDirective],
  templateUrl: './hero-carousel.html',
  styleUrl: './hero-carousel.css'
})
export class HeroCarouselComponent implements OnDestroy {
  readonly slides: readonly HeroSlide[] = [
    {
      image: 'images/labs/engineering.jpg',
      alt: 'Laboratoire d’ingénierie ENSA',
      title: 'Recherche & ingénierie d’excellence',
      subtitle:
        'Des laboratoires universitaires ouverts aux collaborations scientifiques, industrielles et sociétales.'
    },
    {
      image: 'images/labs/innovation.jpg',
      alt: 'Innovation scientifique ENSA',
      title: 'Innovation au service du territoire',
      subtitle:
        'Une plateforme de recherche multidisciplinaire pour accélérer la valorisation et le transfert technologique.'
    }
  ];

  readonly currentIndex = signal(0);
  readonly previousIndex = signal<number | null>(null);
  readonly direction = signal<NavigationDirection>('forward');

  readonly currentSlide = computed(() => this.slides[this.currentIndex()]);
  readonly previousSlide = computed(() => {
    const index = this.previousIndex();
    return index === null ? null : this.slides[index];
  });

  private animationResetTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnDestroy(): void {
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

    const direction: NavigationDirection = index > this.currentIndex() ? 'forward' : 'backward';
    this.navigateTo(index, direction);
  }

  protected trackByIndex(index: number): number {
    return index;
  }

  private navigateTo(index: number, direction: NavigationDirection): void {
    this.direction.set(direction);
    this.previousIndex.set(this.currentIndex());
    this.currentIndex.set(index);

    if (this.animationResetTimeout) {
      clearTimeout(this.animationResetTimeout);
    }

    this.animationResetTimeout = setTimeout(() => {
      this.previousIndex.set(null);
      this.animationResetTimeout = null;
    }, 620);
  }
}