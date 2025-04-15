import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BungeinvoicingRoute } from './bungeinvoicing.routing.module';
import { BungeApiService } from './bungeinvoicing.service';
import { MatDialogModule } from '@angular/material/dialog';
import { AfsInvoicesPopupModule } from '../../afs-invoices-popup/afs-invoices-popup.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BungeinvoicingComponent } from './bungeinvoicing.component';
import { RouterModule, Routes } from '@angular/router';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select'; 

@NgModule({
  declarations: [
    BungeinvoicingComponent
  ],
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    BungeinvoicingRoute,
    MatDialogModule,
    FormsModule,
    AfsInvoicesPopupModule,
    SharedModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule
  ],
  exports: [
    BungeinvoicingComponent
  ],
  providers: [BungeApiService]
})
export class BungeinvoicingModule { }
