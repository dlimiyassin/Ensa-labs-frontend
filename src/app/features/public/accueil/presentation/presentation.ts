import { Component, signal } from '@angular/core';
import { AnimateDirective } from '../../../../shared/animations/animate.directive';
import { HeroCarouselComponent } from "./hero-carousel/hero-carousel";

@Component({
  selector: 'app-presentation',
  imports: [AnimateDirective, HeroCarouselComponent],
  templateUrl: './presentation.html',
  styleUrl: './presentation.css',
})
export class Presentation {
}
