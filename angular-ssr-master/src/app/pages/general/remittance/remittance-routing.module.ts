import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RemittanceComponent } from './remittance.component';

const routes: Routes = [
    {
      path: '',
      component: RemittanceComponent,
    },
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class RemittanceRoutingModule { }