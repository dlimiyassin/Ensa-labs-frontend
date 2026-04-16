import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostBinding,
  OnDestroy,
  Renderer2,
  inject,
  input,
  numberAttribute
} from '@angular/core';

import {
  DEFAULT_ANIMATION_DELAY_MS,
  DEFAULT_ANIMATION_DURATION_MS,
  GLOBAL_ANIMATION_MAP,
  type GlobalAnimationName
} from './animations';

@Directive({
  selector: '[appViewportAnimate]',
  standalone: true
})
export class ViewportAnimateDirective implements AfterViewInit {
  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  readonly appViewportAnimate = input.required<GlobalAnimationName>();
  readonly appViewportAnimateDuration = input(DEFAULT_ANIMATION_DURATION_MS, {
    transform: numberAttribute
  });
  readonly appViewportAnimateDelay = input(DEFAULT_ANIMATION_DELAY_MS, {
    transform: numberAttribute
  });

  private revealed = false;
  private observer?: IntersectionObserver;

  @HostBinding('style.--app-animate-duration')
  protected get cssDurationVar(): string {
    return `${this.appViewportAnimateDuration()}ms`;
  }

  @HostBinding('style.--app-animate-delay')
  protected get cssDelayVar(): string {
    return `${this.appViewportAnimateDelay()}ms`;
  }

  @HostBinding('style.opacity')
  protected get hostOpacity(): string {
    return this.revealed ? '1' : '0';
  }

  ngAfterViewInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.revealed = true;
      this.applyAnimationClass();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || this.revealed) {
            continue;
          }

          this.revealed = true;
          this.applyAnimationClass();
          this.observer?.disconnect();
          break;
        }
      },
      { threshold: 0.2 }
    );

    this.observer.observe(this.element.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private applyAnimationClass(): void {
    const animationClass = GLOBAL_ANIMATION_MAP.get(this.appViewportAnimate())?.cssClass;

    if (!animationClass) {
      return;
    }

    this.renderer.addClass(this.element.nativeElement, animationClass);
  }
}
