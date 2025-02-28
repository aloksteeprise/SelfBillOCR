import { Component } from '@angular/core';
import { NotificationPopupService } from './notification-popup.service';

@Component({
  selector: 'app-notification-popup',
  templateUrl: './notification-popup.component.html',
  styleUrls: ['./notification-popup.component.scss'],
})
export class NotificationPopupComponent {
  isVisible = false;
  message = '';
  header = '';
  type = 'info';
  callback?: () => void;

  constructor(private notificationService: NotificationPopupService) {
    this.notificationService.notification$.subscribe((data) => {

      if (!data) return; // Ignore null initial value 
      this.message = data.message;
      this.header = data.header || 'Alert';
      this.type = data.type || 'info';
      this.callback = data.callback;
      this.isVisible = true;
    });
  }

  closePopup() {
    this.isVisible = false;
    this.notificationService.triggerCallback(this.callback); // Trigger the callback
  }
}
