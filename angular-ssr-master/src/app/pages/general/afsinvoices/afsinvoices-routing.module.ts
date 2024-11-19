import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AfsInvoicesComponent } from './afsinvoices.component';

const routes: Routes = [
    {
      path: '',
      component: AfsInvoicesComponent,
    },
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class afsInvoiceRoute { }