import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AfsinvoiceComponent } from './afsinvoice.component';  // Updated import

const routes: Routes = [
  { path: '', component: AfsinvoiceComponent },  // Updated component
];

@NgModule({
  imports: [RouterModule.forChild(routes)],  // Setup routing for AfsinvoiceComponent
  exports: [RouterModule]
})
export class AfsinvoiceRoutingModule { }  // Updated module name
