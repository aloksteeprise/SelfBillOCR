import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { InvoiceRoutingModule } from './invoice-routing.module';
import { InvoiceComponent } from './invoice.component';
import { InvoiceService } from './invoice.service'; 
// import { HttpClientModule } from '@angular/common/http';
// import { BrowserModule } from '@angular/platform-browser';

import { SecurePipe } from './secure.pipe';



@NgModule({
  declarations: [
    InvoiceComponent,
    SecurePipe,
  ],
  imports: [
    CommonModule,
    InvoiceRoutingModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    // HttpClientModule,  // Add HttpClientModule here
    // BrowserModule
  ],
  exports: [
    InvoiceComponent
  ],
  providers: [InvoiceService],
})
export class InvoiceModule { }

