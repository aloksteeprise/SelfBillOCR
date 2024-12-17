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
import { MatDialogModule } from '@angular/material/dialog';
import { AfsInvoicesPopupModule } from '../afs-invoices-popup/afs-invoices-popup.module';
import { FormsModule } from '@angular/forms';
// import { ConfirmationPopComponent } from '../confirmation-pop/confirmation-pop.component';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  declarations: [
    AfsInvoicesComponent,
    // ConfirmationPopComponent
  ],
  imports: [    
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    afsInvoiceRoute,
    MatSortModule,
    MatDialogModule,
    FormsModule,
    AfsInvoicesPopupModule,
    SharedModule
  ],
  exports: [
    AfsInvoicesComponent,
  ],
  providers: [ApiService]
})
export class afsInvoiceModule { }


