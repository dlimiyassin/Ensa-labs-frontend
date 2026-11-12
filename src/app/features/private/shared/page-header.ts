import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AdminScopeService } from './admin-scope.service';

/** Title bar of a dashboard list page: search box, lab filter (super admin) and "add" button. */
@Component({
  selector: 'app-admin-page-header',
  imports: [FormsModule, ButtonModule, IconFieldModule, InputIconModule, InputTextModule, SelectModule],
  template: `
    <header class="admin-page-header">
      <div>
        <h1>{{ title() }}</h1>
        @if (subtitle()) {
          <p>{{ subtitle() }}</p>
        }
      </div>
      <div class="admin-page-header__tools">
        @if (searchable()) {
          <p-iconfield>
            <p-inputicon styleClass="pi pi-search" />
            <input pInputText type="search" placeholder="Rechercher..." [ngModel]="search()" (ngModelChange)="searchChange.emit($event)" />
          </p-iconfield>
        }
        @if (showLabFilter() && scope.canSwitchLab()) {
          <p-select [options]="scope.labOptions()" optionLabel="value" optionValue="value" [showClear]="true"
                    placeholder="Tous les laboratoires" [ngModel]="scope.currentLab()" (ngModelChange)="scope.selectLab($event)" />
        }
        @if (addLabel()) {
          <p-button icon="pi pi-plus" [label]="addLabel()" (onClick)="add.emit()" />
        }
      </div>
    </header>
  `
})
export class AdminPageHeaderComponent {
  protected readonly scope = inject(AdminScopeService);

  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly addLabel = input('');
  readonly searchable = input(true);
  readonly search = input('');
  readonly showLabFilter = input(true);

  readonly add = output<void>();
  readonly searchChange = output<string>();
}
