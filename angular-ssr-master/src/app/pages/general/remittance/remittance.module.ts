import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RemittanceRoutingModule } from './remittance-routing.module';
import { RemittanceComponent } from './remittance.component';
import { InvoiceService } from './remittance.service'; 
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input';  
// import { ConfirmationPopComponent } from '../confirmation-pop/confirmation-pop.component';
import { SharedModule } from '../shared/shared.module'; 
import { FormsModule } from '@angular/forms';

//  import { SecurePipe } from './secure.pipe'; 

@NgModule({
  declarations: [
    RemittanceComponent,
    // ConfirmationPopComponent
    // SecurePipe,
  ],
  imports: [
    CommonModule,
    RemittanceRoutingModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,  
    MatInputModule ,
    SharedModule  ,
    FormsModule   
  ],
  exports: [
    RemittanceComponent,
    // ConfirmationPopComponent
  ],
  providers: [InvoiceService],
})
export class RemittanceModule { }
