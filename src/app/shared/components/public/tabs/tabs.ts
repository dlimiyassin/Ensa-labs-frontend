import { Component, input, output } from '@angular/core';

export interface TabItem {
  readonly id: string;
  readonly label: string;
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  templateUrl: './tabs.html',
  styleUrl: './tabs.css'
})
export class TabsComponent {
  readonly tabs = input<readonly TabItem[]>([]);
  readonly activeId = input.required<string>();
  readonly tabChange = output<string>();
}
