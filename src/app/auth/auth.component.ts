import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthResponseData, AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  
  isLoginMode:boolean =true;
  isLoading:boolean = false;
  error:string = null;
  
  authForm : FormGroup;
  authObs:Observable<AuthResponseData>;
  destroy$ = new Subject();
  
  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router:Router) { }

  ngOnInit(): void {
    this.authForm = this.fb.group({
      email : new FormControl('',[Validators.required,Validators.email]),
      password: new FormControl('',[Validators.required,Validators.minLength(6)])
    });

    
  }

  onSwitchMode(){
    this.isLoginMode= !this.isLoginMode;
  }

  onSubmit(){
    if(this.authForm.invalid){
      return;
    }

    const email = this.authForm.controls['email'].value;
    const password = this.authForm.controls['password'].value;
    
    

    this.isLoading= true;
    if(this.isLoginMode){
      this.authObs = this.authService.logIn(email,password);
    }
    else{
      this.authObs = this.authService.signUp(email,password);
    }

    this.authObs.pipe(takeUntil(this.destroy$)).subscribe(
      respData=>{  console.log(respData);
      this.isLoading = false;
      this.router.navigate(['./recipes']);
      },
      errorMessage =>{
        console.log(errorMessage);
       this.error = errorMessage;
       this.isLoading = false;
      }
    );

    this.authForm.reset();
  }

  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }

}
