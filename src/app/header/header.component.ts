import { Component, OnDestroy, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { DataStorageService } from '../shared/data-storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated:boolean;
  destroy$ = new Subject();

  constructor(private dataStorageService:DataStorageService,
    private authService: AuthService){ 
  }

  ngOnInit(){
    this.authService.user.pipe(takeUntil(this.destroy$)).subscribe(user =>{
      this.isAuthenticated = !!user;
    });
  }

  onSaveData(){
    this.dataStorageService.storeRecipes();
  }

  onFetchRecipes(){
    this.dataStorageService.fetchRecipes().subscribe();
  }

  onLogout(){
    this.authService.logOut();
  }

  ngOnDestroy(){
    this.destroy$.next();
    this.destroy$.complete();
  }
}
