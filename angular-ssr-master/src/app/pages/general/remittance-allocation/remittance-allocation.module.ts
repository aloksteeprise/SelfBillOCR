import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemittanceAllocationComponent } from './remittance-allocation.component';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
    declarations: [RemittanceAllocationComponent], // Declare the component
    imports: [
      CommonModule, 
      FormsModule, 
    
      MatAutocompleteModule,
      ReactiveFormsModule

    ],
    exports: [RemittanceAllocationComponent] // Export if needed elsewhere
  })
  export class RemittanceAllocationModule { }