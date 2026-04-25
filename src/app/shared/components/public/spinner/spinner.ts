import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  templateUrl: './spinner.html',
  styleUrl: './spinner.css'
})
export class SpinnerComponent {
  readonly message = input('Chargement des données...');
}
