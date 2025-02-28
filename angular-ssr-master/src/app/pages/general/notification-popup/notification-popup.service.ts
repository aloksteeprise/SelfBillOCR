import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

interface NotificationData {
  message: string;
  header?: string; // Default: 'Alert'
  type?: string;   // Default: 'info' (e.g., success, error, warning)
  callback?: () => void; // Optional callback function
}

@Injectable({
  providedIn: 'root',
})
export class NotificationPopupService {
  private notificationVisibility = new BehaviorSubject<boolean>(false);
  private notificationSubject =new BehaviorSubject<NotificationData | null>(null);// new Subject<NotificationData>();

  // Exposed observables
  notificationVisibility$ = this.notificationVisibility.asObservable();
  notification$ = this.notificationSubject.asObservable();

  /**
   * Displays a notification with specified message, header, type, and an optional callback.
   */
  showNotification(
    message: string,
    header: string = 'Alert',
    type: string = 'info',
    callback?: () => void
  ) {
    this.notificationSubject.next({ message, header, type, callback });

    debugger
    this.setNotificationVisibility(true);
  }

  /**
   * Sets the visibility of the notification popup.
   */
  setNotificationVisibility(isVisible: boolean) {
    this.notificationVisibility.next(isVisible);
  }

  /**
   * Executes the callback function if provided.
   */
  triggerCallback(callback?: () => void) {
    if (callback) {
      callback();
    }
  }
}
