import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-title',
  standalone: true,
  templateUrl: './section-title.html',
  styleUrl: './section-title.css'
})
export class SectionTitleComponent {
  readonly label = input<string>('');
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly align = input<'left' | 'center'>('left');
}
