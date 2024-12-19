import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RemittancenotificationComponent } from './remittancenotification.component';

const routes: Routes = [
    {
      path: '',
      component: RemittancenotificationComponent,
    },
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class remittancenotificationRoute { }