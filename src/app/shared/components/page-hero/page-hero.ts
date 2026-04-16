import { Component, input } from '@angular/core';

import { AnimateDirective } from '../../animations/animate.directive';

@Component({
  selector: 'app-page-hero',
  standalone: true,
  imports: [AnimateDirective],
  templateUrl: './page-hero.html',
  styleUrl: './page-hero.css'
})
export class PageHeroComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | undefined>();
  readonly image = input.required<string>();
}
