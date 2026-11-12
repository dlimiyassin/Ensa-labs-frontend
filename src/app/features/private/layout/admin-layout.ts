import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../core/auth/auth.service';
import { FilesService } from '../../../core/services/files.service';
import { AdminScopeService } from '../shared/admin-scope.service';
import { ROLE_LABELS } from '../shared/labels';
import { ADMIN_NAV_SECTIONS } from './admin-nav';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AvatarModule, ButtonModule, ConfirmDialogModule, ToastModule, TooltipModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast position="top-right" />
    <p-confirmdialog [style]="{ width: '28rem' }" />

    <div class="admin-shell" [class.is-menu-open]="menuOpen()">
      <aside class="admin-sidebar">
        <a routerLink="/" class="admin-sidebar__brand" pTooltip="Voir le site public" tooltipPosition="right">
          <img src="images/logo.png" alt="ENSA Labs" />
        </a>
        <nav class="admin-sidebar__nav" aria-label="Navigation du tableau de bord">
          @for (section of sections(); track section.title) {
            <p class="admin-sidebar__section">{{ section.title }}</p>
            @for (item of section.items; track item.route) {
              <a [routerLink]="item.route" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: item.route === '/private' }"
                 class="admin-sidebar__link">
                <i [class]="item.icon"></i>
                <span>{{ item.label }}</span>
              </a>
            }
          }
        </nav>
        <a routerLink="/" class="admin-sidebar__public"><i class="pi pi-external-link"></i> Site public</a>
      </aside>

      <div class="admin-backdrop" (click)="menuOpen.set(false)"></div>

      <div class="admin-main">
        <header class="admin-topbar">
          <p-button class="admin-topbar__menu" icon="pi pi-bars" [text]="true" [rounded]="true" ariaLabel="Menu" (onClick)="menuOpen.update(v => !v)" />
          <div class="admin-topbar__scope">
            @if (auth.labAcronym(); as lab) {
              <span class="admin-chip"><i class="pi pi-building"></i> {{ lab }}</span>
            }
            @for (role of roleLabels(); track role) {
              <span class="admin-chip admin-chip--role">{{ role }}</span>
            }
          </div>
          <div class="admin-topbar__user">
            @if (avatarUrl(); as url) {
              <p-avatar [image]="url" shape="circle" />
            } @else {
              <p-avatar [label]="initials()" shape="circle" styleClass="admin-avatar" />
            }
            <div class="admin-topbar__identity">
              <strong>{{ auth.displayName() }}</strong>
              <small>{{ auth.currentUser()?.username }}</small>
            </div>
            <p-button icon="pi pi-sign-out" [text]="true" [rounded]="true" severity="secondary" pTooltip="Se déconnecter"
                      tooltipPosition="bottom" ariaLabel="Se déconnecter" (onClick)="logout()" />
          </div>
        </header>

        <main class="admin-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class AdminLayout implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly scope = inject(AdminScopeService);
  private readonly files = inject(FilesService);
  private readonly router = inject(Router);

  protected readonly menuOpen = signal(false);

  protected readonly sections = computed(() => ADMIN_NAV_SECTIONS
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.length === 0 || this.auth.hasAnyRole(item.roles))
    }))
    .filter((section) => section.items.length > 0));

  protected readonly roleLabels = computed(() => this.auth.roles()
    .filter((role) => role !== 'ROLE_RESEARCHER' || this.auth.roles().length === 1)
    .map((role) => ROLE_LABELS[role]));

  protected readonly avatarUrl = computed(() => this.files.imageUrl(this.auth.currentUser()?.image));
  protected readonly initials = computed(() => this.auth.displayName()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase());

  ngOnInit(): void {
    this.scope.loadLabs();
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => this.menuOpen.set(false));
  }

  protected logout(): void {
    this.auth.logout();
  }
}
