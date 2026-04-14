import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-lab-presentation',
  imports: [],
  templateUrl: './lab-presentation.html',
  styleUrl: './lab-presentation.css',
})
export class LabPresentation {
  
  labName = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const code = params.get('code');
      this.labName = code || '';
      console.log(this.labName);
    });
  }

}
