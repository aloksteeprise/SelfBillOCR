import {
  Component,
} from "@angular/core";


@Component({
  selector: 'app-confirmation-pop',
  // standalone: true,
  // imports: [],
  templateUrl: './confirmation-pop.component.html',
  styleUrl: './confirmation-pop.component.css'
})
export class ConfirmationPopComponent {
  isVisible = false;
  message: string = '';
  header: string = '';
  type: string = 'warning'; // Default type
  saveCallback?: () => void;
  cancelCallback?: () => void;

  // Method to open the popup
  openPopup(
    header: string,
    message: string,
    type: string = 'info',
    onSave?: () => void,
    onCancel?: () => void
  ) {
    this.header = header;
    this.message = message;
    this.type = type;
    this.saveCallback = onSave;
    this.cancelCallback = onCancel;
    this.isVisible = true;
  }

  onSave() {
    this.isVisible = false;
    if (this.saveCallback) {
      this.saveCallback();
    }
  }

  onCancel() {
    this.isVisible = false;
    if (this.cancelCallback) {
      this.cancelCallback();
    }
  }
}