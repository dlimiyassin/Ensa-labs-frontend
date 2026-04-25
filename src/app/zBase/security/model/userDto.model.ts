import {RoleDto} from "./roleDto.model";

export class UserDto {
    public id!: string;
    public firstName!: string;
    public lastName!: string;
    public email!: string;
    public password!: string;
    public phoneNumber!: string;
    public enabled!: boolean;
    public roleDtos: Array<RoleDto>;
    //public status! : UserStatus | null;
    public lastLogin!: string;

    constructor() {
        this.roleDtos = new Array<RoleDto>();
    }
}
