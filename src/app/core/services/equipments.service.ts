import { Injectable } from '@angular/core';
import { EquipmentDTO } from '../models/api.models';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class EquipmentsService extends CrudService<EquipmentDTO> {
  constructor() {
    super('equipments');
  }
}
