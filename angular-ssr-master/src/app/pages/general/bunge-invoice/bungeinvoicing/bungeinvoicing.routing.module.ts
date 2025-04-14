import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BungeinvoicingComponent } from './bungeinvoicing.component';

const routes: Routes = [
    {
      path: '',
      component: BungeinvoicingComponent,
    },
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class BungeinvoicingRoute { }