import { Injectable } from '@angular/core';
import { AxeRechercheDTO } from '../models/api.models';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class AxesRechercheService extends CrudService<AxeRechercheDTO> {
  constructor() {
    super('axes-recherche');
  }
}
