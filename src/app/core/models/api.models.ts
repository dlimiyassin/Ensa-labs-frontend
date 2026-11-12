export type UserStatus = 'ACTIF' | 'EN_ATTENTE' | 'BLOQUE';
export type PublicationType = 'JOURNAL' | 'CONFERENCE' | 'BOOK' | 'COMMUNICATION';
export type MemberGrade = 'PES' | 'MCA' | 'MCH' | 'PA' | 'OTHER';
export type AssociationType = 'ASSOCIATED' | 'PERMENANET';
export type RoleInLab = 'DIRECTEUR' | 'DIRECTEUR_ADJOINT' | 'MEMBER' | 'MANAGEMENT_COMMITTEE';
export type CompetenceType = 'SCIENTIFIC' | 'TECHNOLOGICAL' | 'SECTORIAL' | 'INNOVATION';
export type EquipmentCategory = 'LAB' | 'UNIVERSITY' | 'SHARED' | 'IT';
export type CollaborationScope = 'REGIONAL' | 'NATIONAL' | 'INTERNATIONAL';
export type CollaborationType = 'ACADEMIC' | 'INDUSTRIAL';

/** Authorization roles, as stored by the backend (Spring "ROLE_" prefix). */
export type AppRole = 'ROLE_SUPER_ADMIN' | 'ROLE_LAB_DIRECTOR' | 'ROLE_TEAM_LEADER' | 'ROLE_RESEARCHER';

export interface UserDTO {
  id?: string;
  username?: string;
  cin?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  enabled?: boolean;
  status?: UserStatus;
  roleIds?: string[];
  /** Lab member linked to the account (gives the lab / team scope). */
  memberId?: string | null;
  /** Read-only, ISO instant. */
  lastLogin?: string;
  /** Write-only, optional. */
  password?: string;
}

/** The authenticated account (GET /api/account/me). */
export interface CurrentUserDTO {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  roles: AppRole[];
  memberId?: string;
  labAcronym?: string;
  ledEquipeIds: string[];
  image?: string;
}

export interface DashboardStatsDTO {
  labAcronym?: string;
  labs: number;
  members: number;
  equipes: number;
  publications: number;
  communications: number;
  theses: number;
  collaborations: number;
  equipments: number;
  competences: number;
}

export interface PasswordChangeDTO {
  currentPassword: string;
  newPassword: string;
}

export interface RoleDto {
  id?: string;
  name?: string;
}

export interface PublicationDTO {
  id?: string;
  title?: string;
  type?: PublicationType;
  publicationYear?: number;
  authors?: string[];
  journal?: string;
  conference?: string;
  doi?: string;
  pages?: string;
  labAcronym?: string;
  equipeId?: string | null;
  /** Username of the creator, read-only. */
  createdBy?: string;
}

export interface ThesisDTO {
  id?: string;
  author?: string;
  title?: string;
  defenseDate?: string | null;
  supervisor?: string;
  labAcronym?: string;
}

export interface ProductionDTO {
  id?: string;
  publications?: PublicationDTO[];
  communications?: PublicationDTO[];
  theses?: ThesisDTO[];
  labAcronym?: string;
}

export interface MemberDTO {
  id?: string;
  firstName?: string;
  lastName?: string;
  grade?: MemberGrade;
  speciality?: string;
  establishment?: string;
  associationType?: AssociationType;
  roleInLab?: RoleInLab;
  phdStudents?: string[];
  labAcronym?: string;
  userId?: string | null;
  /** Picture path relative to the backend upload directory. */
  image?: string | null;
}

export interface AxeRechercheDTO {
  id?: string;
  title?: string;
  labAcronym?: string | null;
  equipeId?: string | null;
}

export interface ComiteGestionMembreDTO {
  nomEnseignant?: string;
  roleComite?: string;
  memberId?: string | null;
  /** Picture of the linked member, read-only. */
  image?: string | null;
}

export interface CompetenceDTO {
  id?: string;
  description?: string;
  type?: CompetenceType;
  labAcronym?: string;
}

export interface DepartmentDTO {
  id?: string;
  name?: string;
}

export interface ThematiqueRechercheDTO {
  id?: string;
  name?: string;
}

export interface EquipmentDTO {
  id?: string;
  name?: string;
  category?: EquipmentCategory;
  labAcronym?: string;
}

export interface TagDTO {
  id?: string;
  name?: string;
}

export interface EquipeDTO {
  id?: string;
  name?: string;
  labAcronym?: string;
  axesRecherche?: AxeRechercheDTO[];
  responsable?: MemberDTO | null;
  members?: MemberDTO[];
}

export interface LabDTO {
  id?: string;
  code?: string;
  titleFr?: string;
  titleEn?: string;
  acronym?: string;
  university?: string;
  program?: string;
  accreditationStart?: string | null;
  accreditationEnd?: string | null;
  establishment?: string;
  phone?: string;
  email?: string;
  directeur?: MemberDTO | null;
  directeurAdjoint?: MemberDTO | null;
  members?: MemberDTO[];
  comiteGestion?: ComiteGestionMembreDTO[];
  thematiquesRecherche?: ThematiqueRechercheDTO[];
  axesRecherche?: AxeRechercheDTO[];
  equipments?: EquipmentDTO[];
  competences?: CompetenceDTO[];
  production?: ProductionDTO;
  department?: DepartmentDTO;
  equipes?: EquipeDTO[];
  tags?: TagDTO[];
}

export interface RoleCriteria {
  id?: string;
  name?: string;
}

export interface CollaborationDTO {
  id?: string;
  organization?: string;
  establishment?: string;
  theme?: string;
  nature?: string;
  scope?: CollaborationScope;
  type?: CollaborationType;
  labAcronym?: string;
  /** Partner logo path relative to the backend upload directory. */
  logo?: string | null;
}

export interface RegisterDto {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  cin?: string;
  phoneNumber?: string;
}

export interface RegisterResponse {
  userID?: string;
}

export interface LoginDto {
  username?: string;
  password?: string;
}

export interface JWTAuthResponse {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  /** Access token lifetime in seconds. */
  expiresIn?: number;
}

/** Error body returned by the backend GlobalExceptionHandler. */
export interface ApiErrorDetails {
  message?: string;
  details?: string;
  errors?: Record<string, string>;
}
