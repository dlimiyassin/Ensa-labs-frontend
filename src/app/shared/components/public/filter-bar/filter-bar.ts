import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface FilterField {
  readonly key: string;
  readonly label: string;
  readonly options: readonly string[];
}

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.css'
})
export class FilterBarComponent {
  readonly fields = input<readonly FilterField[]>([]);
  readonly values = input<Record<string, string>>({});
  readonly filterChange = output<{ key: string; value: string }>();

  protected onChange(key: string, value: string): void {
    this.filterChange.emit({ key, value });
  }
}
