import {
  Directive,
  ElementRef,
  HostBinding,
  Renderer2,
  effect,
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
  selector: '[appAnimate]',
  standalone: true,
  host: {
    '[animate.enter]': 'enterAnimationClass()',
    '[animate.leave]': 'leaveAnimationClass()'
  }
})
export class AnimateDirective {
  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);

  readonly appAnimate = input.required<GlobalAnimationName>();
  readonly appAnimateDuration = input(DEFAULT_ANIMATION_DURATION_MS, {
    transform: numberAttribute
  });
  readonly appAnimateDelay = input(DEFAULT_ANIMATION_DELAY_MS, {
    transform: numberAttribute
  });

  @HostBinding('style.--app-animate-duration')
  protected get cssDurationVar(): string {
    return `${this.appAnimateDuration()}ms`;
  }

  @HostBinding('style.--app-animate-delay')
  protected get cssDelayVar(): string {
    return `${this.appAnimateDelay()}ms`;
  }

  protected enterAnimationClass(): string | null {
    const config = GLOBAL_ANIMATION_MAP.get(this.appAnimate());
    return config?.phase === 'enter' ? config.cssClass : null;
  }

  protected leaveAnimationClass(): string | null {
    const config = GLOBAL_ANIMATION_MAP.get(this.appAnimate());
    return config?.phase === 'leave' ? config.cssClass : null;
  }

  constructor() {
    effect((onCleanup) => {
      const config = GLOBAL_ANIMATION_MAP.get(this.appAnimate());
      const emphasisClass = config?.phase === 'emphasis' ? config.cssClass : null;
      const nativeElement = this.element.nativeElement;

      if (!emphasisClass) {
        return;
      }

      this.renderer.removeClass(nativeElement, emphasisClass);
      void nativeElement.offsetWidth;
      this.renderer.addClass(nativeElement, emphasisClass);

      onCleanup(() => {
        this.renderer.removeClass(nativeElement, emphasisClass);
      });
    });
  }
}