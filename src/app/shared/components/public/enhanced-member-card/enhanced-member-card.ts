import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-enhanced-member-card',
  standalone: true,
  templateUrl: './enhanced-member-card.html',
  styleUrl: './enhanced-member-card.css'
})
export class EnhancedMemberCardComponent {
  readonly name = input.required<string>();
  readonly grade = input('');
  readonly speciality = input('');
  readonly role = input('');
  readonly avatar = input('images/members/member.png');
  /** When true the card is a button that emits {@link open} (e.g. to show the profile). */
  readonly interactive = input(false);

  readonly open = output<void>();

  protected hasLeadershipRole(): boolean {
    const normalizedRole = this.role().trim().toLowerCase();
    return normalizedRole === 'directeur' || normalizedRole === 'directeur adjoint' || normalizedRole === 'responsable';
  }

  protected onActivate(): void {
    if (this.interactive()) {
      this.open.emit();
    }
  }
}
