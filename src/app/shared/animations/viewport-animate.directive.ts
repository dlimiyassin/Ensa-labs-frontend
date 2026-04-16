import {
  AfterViewInit,
  booleanAttribute,
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
export class ViewportAnimateDirective implements AfterViewInit, OnDestroy {
  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  readonly appViewportAnimate = input.required<GlobalAnimationName>();
  readonly appViewportAnimateDuration = input(DEFAULT_ANIMATION_DURATION_MS, {
    transform: numberAttribute
  });
  readonly appViewportAnimateDelay = input(DEFAULT_ANIMATION_DELAY_MS, {
    transform: numberAttribute
  });
  readonly appViewportAnimateLeave = input<GlobalAnimationName | null>(null);
  readonly appViewportAnimateBidirectional = input(false, {
    transform: booleanAttribute
  });

  private revealed = false;
  private observer?: IntersectionObserver;
  private activeAnimationClass: string | null = null;

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
      this.applyAnimationClass(this.appViewportAnimate());
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const shouldEnter = entry.isIntersecting && entry.intersectionRatio >= 0.28;
        const shouldLeave =
          this.appViewportAnimateBidirectional() &&
          this.revealed &&
          (!entry.isIntersecting || entry.intersectionRatio <= 0.12);

        if (shouldEnter && !this.revealed) {
          this.revealed = true;
          this.applyAnimationClass(this.appViewportAnimate());

          if (!this.appViewportAnimateBidirectional()) {
            this.observer?.disconnect();
          }
        } else if (shouldLeave) {
          this.revealed = false;
          this.applyAnimationClass(this.resolveLeaveAnimation());
        }
      }
    }, { threshold: [0, 0.12, 0.28] });

    this.observer.observe(this.element.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private applyAnimationClass(animationName: GlobalAnimationName): void {
    const animationClass = GLOBAL_ANIMATION_MAP.get(animationName)?.cssClass;

    if (!animationClass) {
      return;
    }

    if (this.activeAnimationClass) {
      this.renderer.removeClass(this.element.nativeElement, this.activeAnimationClass);
    }

    void this.element.nativeElement.offsetWidth;
    this.renderer.addClass(this.element.nativeElement, animationClass);
    this.activeAnimationClass = animationClass;
  }

  private resolveLeaveAnimation(): GlobalAnimationName {
    const explicitLeaveAnimation = this.appViewportAnimateLeave();
    if (explicitLeaveAnimation) {
      return explicitLeaveAnimation;
    }

    const enterAnimation = this.appViewportAnimate();
    if (enterAnimation === 'softSlideLeft') {
      return 'softSlideOutRight';
    }

    if (enterAnimation === 'softSlideRight') {
      return 'softSlideOutLeft';
    }

    return 'fadeOut';
  }
}
