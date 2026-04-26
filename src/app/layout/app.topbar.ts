import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-topbar',
    template: `
        <div class="topbar-ticker">
            <div class="ticker-track">
                @for (i of items; track $index) {
                    <span>{{ text }}</span>
                }
            </div>
        </div>
    `
})
export class AppTopbar {
    text = "Journée de Présentation des Projets de Recherche du Laboratoire – 30 mai 2026";
    items = Array(10);
}