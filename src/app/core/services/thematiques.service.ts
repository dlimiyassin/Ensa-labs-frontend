import { Injectable } from '@angular/core';
import { ThematiqueRechercheDTO } from '../models/api.models';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class ThematiquesService extends CrudService<ThematiqueRechercheDTO> {
  constructor() {
    super('thematiques-recherche');
  }
}
