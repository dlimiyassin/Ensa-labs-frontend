import { Component, input } from '@angular/core';

@Component({
  selector: 'app-list-block',
  standalone: true,
  templateUrl: './list-block.html',
  styleUrl: './list-block.css'
})
export class ListBlockComponent {
  readonly title = input.required<string>();
  readonly items = input<string[]>([]);
  readonly emptyLabel = input('Aucune donnée disponible.');
}
