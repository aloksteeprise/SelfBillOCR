import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationPopComponent } from '../confirmation-pop/confirmation-pop.component';
import { NotificationPopupService } from '../notification-popup/notification-popup.service';
import { NotificationPopupComponent } from '../notification-popup/notification-popup.component';
import { InputSanitizerDirective } from '../../../shared/input-sanitizer.directive'; // Now there's no circular dependency!
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ConfirmationPopComponent, 
    NotificationPopupComponent, 
    InputSanitizerDirective
  ],
  imports: [CommonModule,
      FormsModule
  ],
  exports: [
    ConfirmationPopComponent, 
    NotificationPopupComponent, 
    InputSanitizerDirective,
    FormsModule
  ],
  providers: [NotificationPopupService]
})
export class SharedModule { }
