import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AuthGuard } from "../auth/auth.guard";
import { RecipeDetailComponent } from "./recipe-detail/recipe-detail.component";
import { RecipeEditComponent } from "./recipe-edit/recipe-edit.component";
import { RecipeResolver } from "./recipe-resolver.resolver";
import { RecipeStartComponent } from "./recipe-start/recipe-start.component";
import { RecipesComponent } from "./recipes.component";


const recipeRoutes =[
    { path:'', component:RecipesComponent,
    canActivate:[AuthGuard],
    children:[
        {path:'',component: RecipeStartComponent},
        {path:'new', component: RecipeEditComponent},
        {path:':id',component:RecipeDetailComponent,resolve : [RecipeResolver]},
        {path:':id/edit',component: RecipeEditComponent}
    ]},
]

@NgModule({
   imports:[RouterModule.forChild(recipeRoutes)],
   exports:[RouterModule]
})
export class RecipeRoutingModule{}