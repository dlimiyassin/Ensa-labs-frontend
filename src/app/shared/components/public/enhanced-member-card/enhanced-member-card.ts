import { Component, input } from '@angular/core';

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

protected hasLeadershipRole(): boolean {
  const normalizedRole = this.role().trim().toLowerCase();
  return normalizedRole === 'directeur' || normalizedRole === 'directeur adjoint' || normalizedRole === 'responsable';
}
}
