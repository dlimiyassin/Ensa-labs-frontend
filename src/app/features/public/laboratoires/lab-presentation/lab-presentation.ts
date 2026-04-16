import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-lab-presentation',
  imports: [PageHeroComponent],
  templateUrl: './lab-presentation.html',
  styleUrl: './lab-presentation.css'
})
export class LabPresentation {
  private readonly route = inject(ActivatedRoute);

  readonly code = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('code') || 'Laboratoire')
    ),
    { initialValue: 'LaRESI' }
  );

  readonly labName = this.code;

  readonly imageLab = toSignal(
    this.route.paramMap.pipe(
      map(params => {
        const code = params.get('code');

        switch (code) {
          case 'LaRESI':
            return 'images/labs/lab1.jpg';
          case 'LRSTA':
            return 'images/labs/lab2.jpg';
          default:
            return 'images/labs/lab1.jpg';
        }
      })
    ),
    { initialValue: 'images/labs/lab1.jpg' }
  );

}
