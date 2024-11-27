import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AfsinvoiceComponent } from './afsinvoice.component';  // Changed to AfsinvoiceComponent
import { AfsinvoiceRoutingModule } from './afsinvoice-routing.module';  // Changed to AfsinvoiceRoutingModule
import { FormsModule } from '@angular/forms';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [
    CommonModule,
    AfsinvoiceRoutingModule,  
    FormsModule,
    NgxImageZoomModule
  ],
  exports: [
    AfsinvoiceComponent  
  ],
  declarations: [
    AfsinvoiceComponent  
  ],
  providers: [],
})
export class AfsinvoiceModule { }  
