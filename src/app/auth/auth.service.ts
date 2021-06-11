import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Subject, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { User } from "./user.model";

export interface AuthResponseData{
    kind: string,
    idToken: string,
    email: string,
    refreshToken: string,
    expiresIn: string,
    localId: string
}


@Injectable({providedIn : 'root'})
export class AuthService {

    user = new BehaviorSubject<User>(null);
    private tokenExpirationTimer: any;

    constructor(private http:HttpClient,
        private router:Router){

    }

    signUp(email:string,password:string){
        
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='+environment.firbaseApiKey,
            {
                email :email,
                password :password,
                returnSecureToken  :true 
            }
        ).pipe(catchError(error=>this.handleError(error)),
        tap(resData =>this.handleAuthentication(resData.email,resData.localId,resData.idToken,+resData.expiresIn)));
    }


    logIn(email:string,password:string){
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+environment.firbaseApiKey,
            {
                email :email,
                password :password,
                returnSecureToken :true 
            }
        ).pipe(catchError(error =>this.handleError(error)),
        tap(resData =>this.handleAuthentication(resData.email,resData.localId,resData.idToken,+resData.expiresIn)));
    }

    autoLogin(){
        const  userData:{
            email: string;
            id:string;
            _token:string;
            _tokenExpirationDate: Date
        } = JSON.parse(localStorage.getItem('userData'));
        
        if(!userData){
            return;
        }

        const loadedUser = new User(userData.email,userData.id,userData._token, new Date(userData._tokenExpirationDate));
        if(loadedUser.token){
            this.user.next(loadedUser);
            const logoutTimer = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
            this.autoLogout(logoutTimer);
        }
    }


    logOut(){
        this.user.next(null);
        this.router.navigate(['./auth']);
        localStorage.removeItem('userData');
        if(this.tokenExpirationTimer){
            clearTimeout(this.tokenExpirationTimer);
        }
        this.tokenExpirationTimer = null;
    }


    autoLogout(expirationDuration: number){
      this.tokenExpirationTimer =  setTimeout(()=>{
            this.logOut();
        },expirationDuration)
    }


    handleAuthentication(email:string, localId:string, idToken:string,expiresIn: number){
        const expirationDate = new Date(
            new Date().getTime()+ expiresIn * 1000 );

        const user = new User(
            email, 
            localId, 
            idToken,
            expirationDate
            );
       this.user.next(user); 
       this.autoLogout(expiresIn * 1000);
       localStorage.setItem('userData', JSON.stringify(user));
    }

    handleError(error:HttpErrorResponse){
        let errorMessage = 'Unknown error occured';

        if(!error.error || !error.error.error){
            return throwError(errorMessage);
        }

        switch(error.error.error.message){
            case 'EMAIL_EXISTS':
                errorMessage = 'Email exists already';
                break;
            case 'EMAIL_NOT_FOUND':
                errorMessage = 'There is no user record corresponding to this email address.';
                break;
            case 'INVALID_PASSWORD':
                errorMessage = 'The password is invalid or the user does not have a password.'
                break;
            case 'USER_DISABLED':
                errorMessage = 'The user account has been disabled by an administrator.'
                break;
        }
        return throwError(errorMessage);
    }

}