import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionFormComponent } from './transaction-form.component';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';



@NgModule({
    declarations: [TransactionFormComponent], // Declare the component
    imports: [
      CommonModule, 
      FormsModule, 
      MatTableModule,
      MatSortModule

    ],
    exports: [TransactionFormComponent] // Export if needed elsewhere
  })
  export class TransactionFormModule { }