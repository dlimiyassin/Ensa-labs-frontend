import { Component, input } from '@angular/core';
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
export class AnimatedSectionComponent {
  readonly reverse = input(false);
  readonly enter = input<GlobalAnimationName>('softSlideRight');
  readonly leave = input<GlobalAnimationName>('softSlideOutRight');
  readonly compact = input(false);
}
