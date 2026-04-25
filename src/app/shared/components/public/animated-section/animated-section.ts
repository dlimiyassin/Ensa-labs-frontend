import { AfterViewInit, Component, ElementRef, inject, input, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { ViewportAnimateDirective } from '../../../animations/viewport-animate.directive';
import { GlobalAnimationName } from '../../../animations/animations';

@Component({
  selector: 'app-animated-section',
  standalone: true,
  imports: [NgClass, ViewportAnimateDirective],
  templateUrl: './animated-section.html',
  styleUrl: './animated-section.css'
})
export class AnimatedSectionComponent implements AfterViewInit {
  readonly reverse = input(false);
  readonly enter = input<GlobalAnimationName>('softSlideRight');
  readonly leave = input<GlobalAnimationName>('softSlideOutRight');
  readonly compact = input(false);
  protected readonly twoColumns = signal(false);

  private readonly hostElement = inject(ElementRef<HTMLElement>);

  ngAfterViewInit(): void {
    const section = this.hostElement.nativeElement.querySelector('.animated-section');
    const directChildren = section
      ? Array.from(section.children as HTMLCollectionOf<HTMLElement>)
        .filter((child) => child.textContent?.trim().length || child.children.length)
      : [];

    this.twoColumns.set(!this.compact() && directChildren.length === 2);
  }
}
