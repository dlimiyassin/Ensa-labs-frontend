import { Injectable } from '@angular/core';
import { CompetenceDTO } from '../models/api.models';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class CompetencesService extends CrudService<CompetenceDTO> {
  constructor() {
    super('competences');
  }
}
