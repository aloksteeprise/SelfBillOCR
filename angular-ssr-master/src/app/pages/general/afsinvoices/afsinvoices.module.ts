import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { BrowserModule } from '@angular/platform-browser';
// import { HttpClientModule } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AfsInvoicesComponent } from './afsinvoices.component';
import { afsInvoiceRoute } from './afsinvoices-routing.module';
import { ApiService } from './afsinvoices.service';


@NgModule({
  declarations: [
    AfsInvoicesComponent
  ],
  imports: [    
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    afsInvoiceRoute,
    MatSortModule
  ],
  exports: [
    AfsInvoicesComponent,
  ],
  providers: [ApiService]
})
export class afsInvoiceModule { }


