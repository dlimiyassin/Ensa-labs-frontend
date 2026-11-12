import { Injectable } from '@angular/core';
import { ThesisDTO } from '../models/api.models';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class ThesesService extends CrudService<ThesisDTO> {
  constructor() {
    super('theses');
  }
}
