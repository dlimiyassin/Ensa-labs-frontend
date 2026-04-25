import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-section-link',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './section-link.html',
  styleUrl: './section-link.css'
})
export class SectionLinkComponent {
  readonly label = input('Voir plus');
  readonly to = input.required<string>();
  readonly fragment = input<string | null>(null);
}
