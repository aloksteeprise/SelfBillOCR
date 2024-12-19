import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationPopComponent } from '../confirmation-pop/confirmation-pop.component'; 
import { NotificationPopupService } from '../notification-popup/notification-popup.service';
import { NotificationPopupComponent } from '../notification-popup/notification-popup.component';

@NgModule({
  declarations: [ConfirmationPopComponent, NotificationPopupComponent], // Declare both components
  imports: [CommonModule], // Import necessary modules
  exports: [ConfirmationPopComponent, NotificationPopupComponent], // Export components to make them available in other modules
  providers: [NotificationPopupService] // Provide the service
})
export class SharedModule { }
