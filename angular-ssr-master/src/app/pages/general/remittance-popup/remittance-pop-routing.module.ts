import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RemittancePopupComponent } from './remittance-popup.component';  // Updated import

const routes: Routes = [
  { path: '', component: RemittancePopupComponent },  // Updated component
];

@NgModule({
  imports: [RouterModule.forChild(routes)],  // Setup routing for AfsinvoiceComponent
  exports: [RouterModule]
})
export class RemittancePopRoutingModule { }  // Updated module name
