import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemittanceAllocationComponent } from './remittance-allocation.component';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';


@NgModule({
    declarations: [RemittanceAllocationComponent], // Declare the component
    imports: [
      CommonModule, 
      FormsModule, 

    ],
    exports: [RemittanceAllocationComponent] // Export if needed elsewhere
  })
  export class RemittanceAllocationModule { }