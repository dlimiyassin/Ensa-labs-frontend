import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject, Observable} from 'rxjs';
import {TokenService} from "./token.service";
import {UserDto} from "../model/userDto.model";
import {RoleDto} from "../model/roleDto.model";
import { RegisterDto } from '../model/registerDto.model';
import { LoginDto } from '../model/loginDto.model';
import { JWTAuthResponse } from '../model/JWTAuthResponse.model';
import { API_BASE_URL } from '../../../../assets/environment/environment';
import { MembersService } from '../../../core/services/members.service';


@Injectable({
    providedIn: 'root'
})
export class AuthService {

    readonly API = API_BASE_URL + 'auth/';

    public _user = new UserDto();
    private _authenticatedUser = new UserDto();
    private _authenticated = <boolean>JSON.parse(<string>localStorage.getItem('autenticated')) || false;
    public _loggedIn = new BehaviorSubject<boolean>(false);
    public loggedIn$ = this._loggedIn.asObservable();
    public error: null = null;

    private rolesSubject = new BehaviorSubject<string[]>([]);
    roles$ = this.rolesSubject.asObservable();

    private _isAdmin = false;
    private _isResearcher = false;


    constructor(private http: HttpClient, private tokenService: TokenService,
                private router: Router,
                private memberService: MembersService
    ) {
    }

    public forgetPassword(email: string): Observable<void> {
        return this.http.post<void>(`${this.API}forgetPassword`, { email });
    }

    public resetPassword(token: string, password: string, confirmationPassword: string): Observable<void>{
        return this.http.post<void>(`${this.API}resetPassword`,{token , "password":password , "confirmationPassword":confirmationPassword});
    }

    isLoading: boolean = false;
    public login(loginDto: LoginDto): Observable<JWTAuthResponse> {
      return this.http.post<JWTAuthResponse>(
        `${this.API}login`,
        loginDto
      );
    }

    handleAfterLogin(resp: JWTAuthResponse) {         
            const token = resp.accessToken;
            const refreshToken = resp.refreshToken;
            
            const decoded = this.tokenService.decodeToken(token);
            const roles = decoded.roles;
            this.rolesSubject.next(roles);
            
            this.tokenService.saveToken(token, refreshToken);
            this.loadInfos();

            if (this.isAdmin) {
              this.router.navigate(['/app/admin/view']);
            } else if (this.isResearcher) {
              this.router.navigate(['/app/researcher/view']);
            }
    }

    public register(registerDto: RegisterDto): Observable<string> {
      return this.http.post<string>(
        `${this.API}register`,
        registerDto
      );
    }

        public loadInfos() {
        const tokenDecoded = this.tokenService.decode();
        console.log(tokenDecoded)
        const firstName = tokenDecoded.firstName;
        const lastName = tokenDecoded.lastName;
        const roles = tokenDecoded.roles;
        const email = tokenDecoded.sub;
        const phoneNumber = tokenDecoded.phoneNumber;
        // this._authenticatedUser.firstName = firstName;
        // this._authenticatedUser.lastName = lastName;
        // this._authenticatedUser.username = username;
        this._authenticatedUser.email = email;
        this._authenticatedUser.roleDtos = roles;

        // this._authenticatedUser.phoneNumber = phoneNumber;
        localStorage.setItem('autenticated', JSON.stringify(true));
        this.authenticated = true;
        this._loggedIn.next(true);


    }

    // public hasRole(role: RoleDto): boolean {
    //     const index = this._authenticatedUser.roleDtos.findIndex(r => r.authority === role.authority);
    //     return index > -1 ? true : false;
    // }


    public logout() {
        this.tokenService.removeTokens();
        localStorage.setItem('autenticated', JSON.stringify(false));
        this.authenticated = false;
        this._loggedIn.next(false);
        this._authenticatedUser = new UserDto();
        this._isAdmin = false
        this._isResearcher = false;

        this.router.navigate(['/auth/login']);
        localStorage.clear();
        console.log('You are logged out successfully');
    }

    get user(): UserDto {
        return this._user;
    }

    set user(value: UserDto) {
        this._user = value;
    }

    get authenticated(): boolean {
        return this._authenticated;
    }

    set authenticated(value: boolean) {
        this._authenticated = value;
    }

    get authenticatedUser(): UserDto {
        return this._authenticatedUser;
    }

    set authenticatedUser(value: UserDto) {
        this._authenticatedUser = value;
    }


    get isResearcher(): boolean {
        const decoded = this.tokenService.decode();
        return decoded?.roles?.includes('ROLE_RESEARCHER') ?? false;
    }

    get isAdmin(): boolean {
        const decoded = this.tokenService.decode();
        return decoded?.roles?.some((r: string) =>
            r === 'ROLE_ADMIN' || r === 'ROLE_SUPER_ADMIN'
        ) ?? false;
    }


    getRoleName(roleDtos: Array<RoleDto> | undefined) {
        if (!roleDtos || roleDtos.length === 0) {
            return 'Role_Name';
        }

        switch (roleDtos[0].name) {
            case 'ROLE_ADMIN':
                return "Administrator";
            case 'ROLE_STUDENT':
                return "Student";
            case 'ROLE_TEACHER':
                return 'Teacher';
            default:
                return 'Role_Name';
        }
    }
}
