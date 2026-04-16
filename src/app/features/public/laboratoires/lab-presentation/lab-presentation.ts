import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero';

@Component({
  selector: 'app-lab-presentation',
  imports: [PageHeroComponent],
  templateUrl: './lab-presentation.html',
  styleUrl: './lab-presentation.css'
})
export class LabPresentation implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly labName = signal('Laboratoire');

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const code = params.get('code');
      this.labName.set(code || 'Laboratoire');
    });
  }
}
