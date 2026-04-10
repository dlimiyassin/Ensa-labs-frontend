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
    text = "Le lancement officiel de la Plateforme Des Laboratoires De L'ENSA Beni Mellal";
    items = Array(10);
}