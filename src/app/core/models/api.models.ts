export type UserStatus = 'ACTIF' | 'EN_ATTENTE' | 'BLOQUE';
export type PublicationType = 'JOURNAL' | 'CONFERENCE' | 'BOOK' | 'COMMUNICATION';
export type MemberGrade = 'PES' | 'MCA' | 'MCH' | 'PA' | 'OTHER';
export type AssociationType = 'ASSOCIATED' | 'PERMENANET';
export type RoleInLab = 'DIRECTEUR' | 'DIRECTEUR_ADJOINT' | 'MEMBER' | 'MANAGEMENT_COMMITTEE';
export type CompetenceType = 'SCIENTIFIC' | 'TECHNOLOGICAL' | 'SECTORIAL' | 'INNOVATION';
export type EquipmentCategory = 'LAB' | 'UNIVERSITY' | 'SHARED' | 'IT';
export type CollaborationScope = 'REGIONAL' | 'NATIONAL' | 'INTERNATIONAL';
export type CollaborationType = 'ACADEMIC' | 'INDUSTRIAL';

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
  equipeId?: string;
}

export interface ThesisDTO {
  id?: string;
  author?: string;
  title?: string;
  defenseDate?: string;
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
  userId?: string;
}

export interface AxeRechercheDTO {
  id?: string;
  title?: string;
  labAcronym?: string;
  equipeId?: string;
}

export interface ComiteGestionMembreDTO {
  nomEnseignant?: string;
  roleComite?: string;
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

export interface DomaineRechercheDTO {
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
  responsable?: MemberDTO;
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
  accreditationStart?: string;
  accreditationEnd?: string;
  establishment?: string;
  phone?: string;
  email?: string;
  directeur?: MemberDTO;
  directeurAdjoint?: MemberDTO;
  members?: MemberDTO[];
  comiteGestion?: ComiteGestionMembreDTO[];
  domainesRecherche?: DomaineRechercheDTO[];
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
        id?: String;
        organization?: String;
        establishment?: String;
        theme?: String;
        nature?: String;
        scope?: CollaborationScope;
        type?: CollaborationType;
        labAcronym?: String
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
}
