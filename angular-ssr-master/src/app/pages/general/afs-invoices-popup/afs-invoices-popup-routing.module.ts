import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AfsInvoicesPopupComponent } from './afs-invoices-popup.component';

const routes: Routes = [
  {
    path: '',
    component: AfsInvoicesPopupComponent,
  },
  // Add more routes here if needed
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AfsInvoiceRoutingModule {}
