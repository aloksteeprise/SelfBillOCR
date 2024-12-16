import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import  { RemittancePopupComponent } from './remittance-popup.component'
import { RemittancePopRoutingModule } from './remittance-pop-routing.module';


import { FormsModule } from '@angular/forms';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { AfsInvoicesPopupModule } from "../afs-invoices-popup/afs-invoices-popup.module";

@NgModule({
  imports: [
    CommonModule,
    RemittancePopRoutingModule,
    FormsModule,
    NgxImageZoomModule,
    AfsInvoicesPopupModule
],
  exports: [
    RemittancePopupComponent  
  ],
  declarations: [
    RemittancePopupComponent,
   
  ],
  providers: [],
})
export class RemittancePopModule { }  
