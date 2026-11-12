import {
  AppRole,
  AssociationType,
  CollaborationScope,
  CollaborationType,
  CompetenceType,
  EquipmentCategory,
  MemberGrade,
  PublicationType,
  RoleInLab,
  UserStatus
} from '../../../core/models/api.models';

export interface Option<T extends string = string> {
  readonly label: string;
  readonly value: T;
}

function options<T extends string>(labels: Record<T, string>): Option<T>[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}

export const ROLE_LABELS: Record<AppRole, string> = {
  ROLE_SUPER_ADMIN: 'Super administrateur',
  ROLE_LAB_DIRECTOR: 'Directeur de laboratoire',
  ROLE_TEAM_LEADER: "Chef d'équipe",
  ROLE_RESEARCHER: 'Chercheur'
};

export const GRADE_LABELS: Record<MemberGrade, string> = {
  PES: 'PES',
  MCA: 'MCA',
  MCH: 'MCH',
  PA: 'PA',
  OTHER: 'Autre'
};

export const ASSOCIATION_LABELS: Record<AssociationType, string> = {
  PERMENANET: 'Permanent',
  ASSOCIATED: 'Associé'
};

export const ROLE_IN_LAB_LABELS: Record<RoleInLab, string> = {
  DIRECTEUR: 'Directeur',
  DIRECTEUR_ADJOINT: 'Directeur adjoint',
  MANAGEMENT_COMMITTEE: 'Comité de gestion',
  MEMBER: 'Membre'
};

export const PUBLICATION_TYPE_LABELS: Record<PublicationType, string> = {
  JOURNAL: 'Article de revue',
  CONFERENCE: 'Conférence',
  BOOK: 'Livre / chapitre',
  COMMUNICATION: 'Communication'
};

export const COMPETENCE_TYPE_LABELS: Record<CompetenceType, string> = {
  SCIENTIFIC: 'Scientifique et méthodologique',
  TECHNOLOGICAL: 'Savoir-faire technologique',
  SECTORIAL: 'Sectorielle',
  INNOVATION: 'Innovation et transfert'
};

export const EQUIPMENT_CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  LAB: 'Scientifique du laboratoire',
  UNIVERSITY: 'Dotation universitaire',
  SHARED: "Partagé (établissement / université)",
  IT: 'Informatique'
};

export const COLLABORATION_SCOPE_LABELS: Record<CollaborationScope, string> = {
  REGIONAL: 'Régional',
  NATIONAL: 'National',
  INTERNATIONAL: 'International'
};

export const COLLABORATION_TYPE_LABELS: Record<CollaborationType, string> = {
  ACADEMIC: 'Académique',
  INDUSTRIAL: 'Industriel'
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIF: 'Actif',
  EN_ATTENTE: 'En attente',
  BLOQUE: 'Bloqué'
};

export const GRADE_OPTIONS = options(GRADE_LABELS);
export const ASSOCIATION_OPTIONS = options(ASSOCIATION_LABELS);
export const ROLE_IN_LAB_OPTIONS = options(ROLE_IN_LAB_LABELS);
export const PUBLICATION_TYPE_OPTIONS = options(PUBLICATION_TYPE_LABELS);
export const COMPETENCE_TYPE_OPTIONS = options(COMPETENCE_TYPE_LABELS);
export const EQUIPMENT_CATEGORY_OPTIONS = options(EQUIPMENT_CATEGORY_LABELS);
export const COLLABORATION_SCOPE_OPTIONS = options(COLLABORATION_SCOPE_LABELS);
export const COLLABORATION_TYPE_OPTIONS = options(COLLABORATION_TYPE_LABELS);
export const USER_STATUS_OPTIONS = options(USER_STATUS_LABELS);
