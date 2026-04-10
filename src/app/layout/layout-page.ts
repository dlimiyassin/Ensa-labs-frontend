import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AppFooter } from "./app.footer";
import { AppNavbar } from "./app.navbar";
import { AppTopbar } from "./app.topbar";


@Component({
  selector: 'layout-page',
    standalone: true,
    imports: [RouterModule, AppFooter, AppNavbar, AppTopbar],
    template: `
    <div class="layout-wrapper">

      <!-- topbar -->
      <app-topbar class="layout-topbar"/>

      <!-- navbar -->
      <app-navbar class="layout-navbar"/>


      <!-- main -->
      <div class="layout-main">
        <router-outlet></router-outlet>
      </div>
      
      <!-- footer -->
      <app-footer class="layout-footer"/>

  </div>
`

})
export class LayoutPage {

}