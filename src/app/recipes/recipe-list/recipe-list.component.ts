import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Recipe } from '../recipe.model';
import { RecipeService } from '../recipe.service';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit,OnDestroy {

  recipes: Recipe[];
  subscription:Subscription;
  isLoading = false;

  constructor(private recipeService: RecipeService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cdRef:ChangeDetectorRef) { }

  ngOnInit() {
   this.subscription = this.recipeService.recipesChanged.
    subscribe((recipes:Recipe[])=>{
      this.recipes = recipes;
    });
    this.recipes = this.recipeService.getRecipes();
    this.cdRef.detectChanges();
  }

  onNewRecipe(){
    this.router.navigate(['new'],{relativeTo:this.activatedRoute});
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

}
