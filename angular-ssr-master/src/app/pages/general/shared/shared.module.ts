import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationPopComponent } from '../confirmation-pop/confirmation-pop.component'; 
import { NotificationPopupService } from '../notification-popup/notification-popup.service';
import { NotificationPopupComponent } from '../notification-popup/notification-popup.component';
import { InputSanitizerDirective } from '../../../shared/input-sanitizer.directive';
@NgModule({
  declarations: [ConfirmationPopComponent, NotificationPopupComponent, InputSanitizerDirective], // Declare both components
  imports: [CommonModule], // Import necessary modules
  exports: [ConfirmationPopComponent, NotificationPopupComponent, InputSanitizerDirective], // Export components to make them available in other modules
  providers: [NotificationPopupService] // Provide the service
})
export class SharedModule { 
  static isAlphabet(value: string): boolean {
    return /^[a-zA-Z\s]*$/.test(value);
  }
  static isAlphabetWithComma(value: string): boolean {
    return /^[a-zA-Z\s\,]*$/.test(value);
  }

  static isNumber(value: string): boolean {
    return /^\d*\.?\d*$/.test(value);
  }  

  static isAlphanumeric(value: string): boolean {
    return /^[a-zA-Z0-9\s\-\#]*$/.test(value);
}

  static validateDate(dateValue: string, fieldName: string, isRequired: boolean): string | null {
    const today = new Date();
    
    if (!dateValue || dateValue.trim() === '') {
      return isRequired ? `${fieldName} is required.` : null;
    }

    const inputDate = new Date(dateValue);
    const year = inputDate.getFullYear();

    if (isNaN(inputDate.getTime())) {
      return `Invalid date format for ${fieldName}. Please enter a valid date.`;
    }

    if (year < 1900) {
      return `Invalid ${fieldName}.`;
    }

    if (inputDate > today) {
      return `${fieldName} cannot be in the future.`;
    }

    return null; // Date is valid
  }
}
