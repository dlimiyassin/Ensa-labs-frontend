import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { DashboardStatsDTO } from '../../../core/models/api.models';
import { AccountService } from '../../../core/services/account.service';
import { AdminPageHeaderComponent } from '../shared/page-header';
import { AdminScopeService } from '../shared/admin-scope.service';
import { ADMIN_NAV_SECTIONS } from '../layout/admin-nav';

interface StatCard {
  readonly label: string;
  readonly value: number;
  readonly icon: string;
  readonly route?: string;
}

@Component({
  selector: 'app-dashboard-home',
  imports: [RouterLink, AdminPageHeaderComponent],
  template: `
    <app-admin-page-header
      [title]="'Bonjour ' + (auth.currentUser()?.firstName || auth.displayName())"
      [subtitle]="subtitle()"
      [searchable]="false" />

    @if (error()) {
      <p class="admin-alert">{{ error() }}</p>
    }

    <section class="admin-stats" aria-label="Indicateurs">
      @for (card of cards(); track card.label) {
        @if (card.route) {
          <a class="admin-stat" [routerLink]="card.route">
            <i [class]="card.icon"></i>
            <span class="admin-stat__value">{{ loading() ? '…' : card.value }}</span>
            <span class="admin-stat__label">{{ card.label }}</span>
          </a>
        } @else {
          <div class="admin-stat">
            <i [class]="card.icon"></i>
            <span class="admin-stat__value">{{ loading() ? '…' : card.value }}</span>
            <span class="admin-stat__label">{{ card.label }}</span>
          </div>
        }
      }
    </section>

    <section class="admin-panel">
      <h2>Accès rapides</h2>
      <div class="admin-shortcuts">
        @for (item of shortcuts(); track item.route) {
          <a class="admin-shortcut" [routerLink]="item.route">
            <i [class]="item.icon"></i>
            <span>{{ item.label }}</span>
            <i class="pi pi-angle-right"></i>
          </a>
        }
      </div>
    </section>
  `
})
export class DashboardHome {
  protected readonly auth = inject(AuthService);
  private readonly account = inject(AccountService);
  private readonly scope = inject(AdminScopeService);

  protected readonly stats = signal<DashboardStatsDTO | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  protected readonly subtitle = computed(() => {
    const lab = this.scope.currentLab();
    return lab ? `Vue d'ensemble du laboratoire ${lab}.` : "Vue d'ensemble de tous les laboratoires.";
  });

  protected readonly cards = computed<StatCard[]>(() => {
    const s = this.stats();
    const manager = this.auth.hasAnyRole(['ROLE_SUPER_ADMIN', 'ROLE_LAB_DIRECTOR']);
    const link = (route: string) => (manager ? route : undefined);
    const cards: StatCard[] = [
      { label: 'Membres', value: s?.members ?? 0, icon: 'pi pi-users', route: link('/private/membres') },
      { label: 'Équipes', value: s?.equipes ?? 0, icon: 'pi pi-sitemap', route: link('/private/equipes') },
      { label: 'Publications', value: s?.publications ?? 0, icon: 'pi pi-book', route: '/private/publications' },
      { label: 'Communications', value: s?.communications ?? 0, icon: 'pi pi-megaphone', route: '/private/publications' },
      { label: 'Thèses', value: s?.theses ?? 0, icon: 'pi pi-graduation-cap', route: this.auth.hasAnyRole(['ROLE_SUPER_ADMIN', 'ROLE_LAB_DIRECTOR', 'ROLE_TEAM_LEADER']) ? '/private/theses' : undefined },
      { label: 'Collaborations', value: s?.collaborations ?? 0, icon: 'pi pi-globe', route: link('/private/collaborations') },
      { label: 'Équipements', value: s?.equipments ?? 0, icon: 'pi pi-box', route: link('/private/ressources') },
      { label: 'Compétences', value: s?.competences ?? 0, icon: 'pi pi-star', route: link('/private/ressources') }
    ];
    if (!s?.labAcronym) {
      cards.unshift({ label: 'Laboratoires', value: s?.labs ?? 0, icon: 'pi pi-building', route: link('/private/laboratoires') });
    }
    return cards;
  });

  protected readonly shortcuts = computed(() => ADMIN_NAV_SECTIONS
    .flatMap((section) => section.items)
    .filter((item) => item.route !== '/private')
    .filter((item) => item.roles.length === 0 || this.auth.hasAnyRole(item.roles)));

  constructor() {
    effect(() => {
      const lab = this.scope.currentLab();
      this.loading.set(true);
      this.account.stats(lab).subscribe({
        next: (stats) => {
          this.stats.set(stats);
          this.error.set('');
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Impossible de charger les indicateurs.');
          this.loading.set(false);
        }
      });
    });
  }
}
