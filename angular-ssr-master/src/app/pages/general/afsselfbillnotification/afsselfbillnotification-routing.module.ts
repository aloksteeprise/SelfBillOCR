import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AfsselfbillnotificationComponent } from './afsselfbillnotification.component';

const routes: Routes = [
    {
      path: '',
      component: AfsselfbillnotificationComponent,
    },
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class afsselfbillnotificationRoute { }