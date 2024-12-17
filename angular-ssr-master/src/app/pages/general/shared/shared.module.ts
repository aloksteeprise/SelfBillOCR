import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationPopComponent } from '../confirmation-pop/confirmation-pop.component'; // Import the component

@NgModule({
  declarations: [ConfirmationPopComponent],
  imports: [CommonModule],
  exports: [ConfirmationPopComponent] // Export the component for use in other modules
})
export class SharedModule { }
