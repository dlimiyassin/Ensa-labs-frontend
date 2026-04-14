import { Component, signal } from '@angular/core';
import { AnimateDirective } from '../../../../shared/animations/animate.directive';

@Component({
  selector: 'app-presentation',
  imports: [AnimateDirective],
  templateUrl: './presentation.html',
  styleUrl: './presentation.css',
})
export class Presentation {
}
