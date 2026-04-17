import { Component, input } from '@angular/core';

export interface LabCardModel {
  readonly name: string;
  readonly description: string;
  readonly ctaLabel: string;
  readonly image: string;
}

@Component({
  selector: 'app-lab-card',
  imports: [],
  templateUrl: './lab-card.html',
  styleUrl: './lab-card.css'
})
export class LabCardComponent {
  readonly lab = input.required<LabCardModel>();
}
