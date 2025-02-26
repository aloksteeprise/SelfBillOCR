import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionFormComponent } from './transaction-form.component';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from '../shared/shared.module'; 



@NgModule({
    declarations: [TransactionFormComponent], // Declare the component
    imports: [
      CommonModule, 
      FormsModule, 
      MatTableModule,
      MatSortModule,
      MatPaginatorModule,
      SharedModule

    ],
    exports: [TransactionFormComponent] // Export if needed elsewhere
  })
  export class TransactionFormModule { }