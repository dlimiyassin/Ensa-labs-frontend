import { Component, input } from '@angular/core';

export interface ProjectCardModel {
  readonly title: string;
  readonly description: string;
  readonly laboratory: 'LRSTA' | 'LaRESI';
  readonly image: string;
}

@Component({
  selector: 'app-project-card',
  imports: [],
  templateUrl: './project-card.html',
  styleUrl: './project-card.css'
})
export class ProjectCardComponent {
  readonly project = input.required<ProjectCardModel>();
}
