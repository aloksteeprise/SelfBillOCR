import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../constant/api-constants';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationPopupService } from '../notification-popup/notification-popup.service';

@Component({
  selector: 'app-remittancenotification',
  templateUrl: './remittancenotification.component.html',
  styleUrl: './remittancenotification.component.css'
})
export class RemittancenotificationComponent implements OnInit  {

  selectedFile: File | null = null;
  isFileUploadVisible: boolean = true;
  isPdf: boolean = false;
  url: SafeResourceUrl = '';
  token: string | null = null;
  errors: any = {};
  loading: boolean = false;
  showErrorLabel = false;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationPopupService) {
  }

  ngOnInit(): void {
    this.loading = true;
    this.route.queryParams.subscribe(params => {
      const urlToken = params['token'];
      if (urlToken) {
        this.token = urlToken;
        this.validateToken();
      } else {
        this.notificationService.showNotification(             
          'Token is missing. Please provide a valid token to proceed.',
          'Token Error',
          'error',
          () => {
            console.log('OK clicked 1');
          }
        );
      }
    });
  }

  onFileSelect(event: any): void {
    this.selectedFile = event.target.files[0];
    const file = event.target.files[0];
    const fileType = file.type;

    if (fileType === 'application/pdf') {
      this.isPdf = true;
      const objectUrl = URL.createObjectURL(file);
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
    } else {
      this.notificationService.showNotification(             
        'Please upload a valid PDF file to proceed.',
        'Unsupported File Type',
        'error',
        () => {
          const fileInput = document.getElementById('fileInput') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
        this.selectedFile = null;
        this.isFileUploadVisible = true;
          console.log('OK clicked 2');
        }
      );  
    }
  }

  validateToken(): void {
    if (!this.token) {
      this.notificationService.showNotification(             
        'Token is missing. Please provide a valid token to proceed.',
        'Token Error',
        'error',
        () => {
          console.log('OK clicked 3');
        }
      );
      return;
    }

    this.http
      .post<any>('https://localhost:44337/api/SelfBillNotification/ValidateToken', { token: this.token })
      .subscribe(
        (response) => {
          this.loading = false;
          if (response) {
            this.isFileUploadVisible = true;
          } else {
            this.notificationService.showNotification(             
              'The token provided is invalid or has expired. Please provide a valid token to proceed.',
              'Authentication Error',
              'error',
              () => {
                this.showErrorLabel = true; 
                this.isFileUploadVisible = false;
                console.log('OK clicked 4');
              }
            );
          }
        },
        (error) => {
          this.loading = false;
          this.isFileUploadVisible = false;
          //alert(error.statusText);
          // this.notificationService.showNotification(             
          //   error.statusText,
          //   'Upload Failed',
          //   'error',
          //   () => {
          //     console.log('OK clicked 5');
          //   }
          // );
        }
      );
  }

  onUpload(): void {
    if (this.selectedFile) {
      const fileData = new FormData();
      fileData.append('file', this.selectedFile, this.selectedFile.name);

      this.http.post<any>('https://localhost:44337/api/RemittanceNotification/UploadRemittanceNotification', fileData).subscribe(
        (response) => {

          this.selectedFile = null;
          const fileInput = document.getElementById('fileInput') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
            this.url = '';
          }
          this.notificationService.showNotification(             
            'Your file has been uploaded successfully!',
            'INFORMATION',
            'success',
            () => {
              console.log('OK clicked 5');
            }
          );
        },
        (error) => {
          this.notificationService.showNotification(             
            'Something went wrong while uploading your file. Please try again.',
            'Processing Error',
            'error',
            () => {
              console.log('OK clicked 6');
            }
          );
        }
      );
    } else {
      this.notificationService.showNotification(             
        'Please select a file before proceeding.',
        'File Required',
        'error',
        () => {
          console.log('OK clicked 7');
        }
      );
    }
  }

}
