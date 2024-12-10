import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

interface NotificationData {
  message: string;
  header?: string;
  type?: string; // e.g., success, error, warning
  callback?: () => void; // Optional callback function
}

@Injectable({
  providedIn: 'root',
})
export class NotificationPopupService {
  private notificationSubject = new Subject<NotificationData>();
  notification$ = this.notificationSubject.asObservable();

  showNotification(
    message: string,
    header: string = 'Alert',
    type: string = 'info',
    callback?: () => void
  ) {
    this.notificationSubject.next({ message, header, type, callback });
  }

  triggerCallback(callback?: () => void) {
    if (callback) {
      callback(); // Execute the callback function if provided
    }
  }
}
