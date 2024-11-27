import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { AfsInvoicesPopupComponent } from './afs-invoices-popup.component';
import { AfsInvoiceRoutingModule } from './afs-invoices-popup-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgxImageZoomModule,
    
    AfsInvoiceRoutingModule, // Import the routing module
  ],
  // schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [AfsInvoicesPopupComponent],
  exports: [AfsInvoicesPopupComponent],
})
export class AfsInvoicesPopupModule {}
