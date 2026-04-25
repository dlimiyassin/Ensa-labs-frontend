import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {RoleDto} from "../model/roleDto.model";
import { API_BASE_URL } from '../../../../assets/environment/environment';
import { RoleCriteria } from '../../../core/models/api.models';

@Injectable({
    providedIn: 'root'
})
export class RoleService {

    // declarations
    readonly API = API_BASE_URL + "roles/";
    private _roles: Array<RoleDto> = new Array<RoleDto>();
    private _selectedRoles: Array<RoleDto> = new Array<RoleDto>();
    private _roleDialog: boolean = false;
    _role: RoleDto = new RoleDto();
    public _roleSB = new BehaviorSubject<string>('');
    public role$: Observable<string> = this._roleSB.asObservable();
    private _submitted!: boolean;
    private _selectedRole: RoleDto = new RoleDto();
    private _errorMessages: Array<string> = new Array<string>()

    constructor(private http: HttpClient
    ) {
    }


    public findAll() {
        return this.http.get<Array<RoleDto>>(this.API);
    }

    public save(roleDto: RoleDto): Observable<RoleDto> {
        return this.http.post<RoleDto>(this.API, roleDto);
    }

    public findById(id: number) {
        return this.http.get<RoleDto>(this.API + "id/" + id);
    }

    public delete(id: number) {
        return this.http.delete<number>(this.API + "id/" + id);
    }

    public edit(roleDto: RoleDto) {
        return this.http.put<RoleDto>(this.API, roleDto);
    }

    public findByCriteria(roleCriteria: RoleCriteria) {
        return this.http.post<Array<RoleCriteria>>(this.API + "find-by-criteria", roleCriteria);
    }


    // getters and setters
    get roles(): Array<RoleDto> {
        return this._roles;
    }

    set roles(roles: Array<RoleDto>) {
        this._roles = roles;
    }

    get selectedRoles(): Array<RoleDto> {
        return this._selectedRoles;
    }

    set selectedRoles(selectedRoles: Array<RoleDto>) {
        this._selectedRoles = selectedRoles;
    }

    get selectedRole(): RoleDto {
        return this._selectedRole;
    }

    set selectedRole(value: RoleDto) {
        this._selectedRole = value;
    }


    get errorMessages(): Array<string> {
        return this._errorMessages;
    }

    set errorMessages(value: Array<string>) {
        this._errorMessages = value;
    }

    get role(): RoleDto {
        return this._role;
    }

    set role(value: RoleDto) {
        this._role = value;
    }

    deleteAll(selectedRoles: RoleDto[]) {
        if (selectedRoles !== null) {
            selectedRoles.forEach(role => {
                this.delete(Number(role.id)).subscribe({
                    next: () => {
                    },
                    error: (error: HttpErrorResponse) => {
                        console.error(error.message);
                    }
                });
            })
        }
    }
}
