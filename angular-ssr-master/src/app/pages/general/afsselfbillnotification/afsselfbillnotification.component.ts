import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../constant/api-constants';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationPopupService } from '../notification-popup/notification-popup.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-afsselfbillnotification',
  templateUrl: './afsselfbillnotification.component.html',
  styleUrl: './afsselfbillnotification.component.css'
})

export class AfsselfbillnotificationComponent implements OnInit {
  @ViewChild('myForm') myForm: any;

  // id:number = 0;
  // contractorName: string = '';
  // afscontractor: string = '';
  // firstName:string = '';
  // lastName:string = '';
  // startDate: string = '';
  // endDate: string = ''; 
  // totalNumber: string = ''; 
  // invoiceNumber: string = '';
  // invoiceDate: string = '';
  // totalAmount: number = 0;
  // groupNewId: string = '';
  // gridCtcCode: number = 0;
  // contractorOptions: { id: number; firstName: string; lastName: string;fullName: string; }[] = [];
  // filteredContractOptions: { id: number; name: string }[] = []; 
  //imageName: string = '';
  // thumbImage: string = '';
  // fullImagePath: string = ''; 
  //selectedContract: any = null;
  // selectedFilteredContract: string = '';
  //isPopupVisible: boolean = false; 
  //submitted = false;
  // imageWidth: number = 792;
  // pdfFileName:string="";

  selectedFiles: File[] = [];
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
    private notificationService: NotificationPopupService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AfsselfbillnotificationComponent>
  ) {
    console.log('Received data in dialog:', data);
    this.token = data.token;
    console.log('Token:', this.token);
    // this.setImagePath();
   //this.setImagePath(data.invoiceFilePath, data.invoiceFileName);
  }

  // setImagePath(): void {

  //   this.imageName = filePath;
  //   this.uplodedPDFFile =pdfFile;
  //   this.thumbImage = `assets/documents/pdf/${this.imageName}`;
  //   this.fullImagePath = `assets/documents/pdf/${this.imageName}`;    
  //   console.log('Thumb Image:', this.thumbImage);
  //   console.log('Full Image Path:', this.fullImagePath);
  // }

  ngOnInit(): void {
    // this.loading = true;
    // this.route.queryParams.subscribe(params => {
    //   const urlToken = params['token'];
    //   if (urlToken) {
    //     this.token = urlToken;
    //     this.validateToken();
    //   } else {
    //     this.notificationService.showNotification(             
    //       'Token is missing. Please provide a valid token to proceed.',
    //       'Token Error',
    //       'error',
    //       () => {
    //         console.log('OK clicked 1');
    //       }
    //     );
    //   }
    // });
  }


  onFileSelect(event: any): void {
    const files: FileList = event.target.files;
    this.selectedFiles = []; // Reset previous selections
    this.loading = true
  
    if (!files || files.length === 0) {
      return;
    }
  
    const allowedExtensions = ['.pdf', '.xlsx', '.xls'];
    const invalidFiles: string[] = [];
  
    Array.from(files).forEach((file: File) => {
      const fileName = file.name.toLowerCase();
      const isValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
  
      if (isValidExtension) {
        this.selectedFiles.push(file);
        console.log('File selected:', file.name);
        this.loading = false
      } else {
        invalidFiles.push(file.name);
        this.loading = false
      }
    });
  
    // Show notification if any invalid files were found
    if (invalidFiles.length > 0) {
      this.notificationService.showNotification(
        `These files are not supported and were ignored: ${invalidFiles.join(', ')}`,
        'Unsupported File Type',
        'warning',
        () => {
          console.log('Invalid file types ignored');
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

    const apiUrl = environment.API_BASE_URL+'SelfBillNotification/ValidateToken';

    //const apiUrl = 'https://localhost:44337/api/SelfBillNotification/ValidateToken';

    this.http.post<any>(apiUrl, { token: this.token })
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

  closeDialog(): void {
    this.dialogRef.close();
    this.notificationService.setNotificationVisibility(false);
  }

  onUpload(): void {
    this.loading = true
    if (this.selectedFiles.length > 0) {
      const fileData = new FormData();
      
      this.selectedFiles.forEach((file, index) => {
        fileData.append('files', file, file.name);
      });
  
      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`
          });

        

      const apiUrl = environment.API_BASE_URL + 'SelfBillNotification/UploadSelfBillFiles';
  
      this.http.post<any>(apiUrl, fileData,{headers}).subscribe(
        (response) => {
          this.selectedFiles = [];
          const fileInput = document.getElementById('fileInput') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
          this.loading = false
          this.notificationService.showNotification(
            'Please note that uploaded files will undergo processing at the background, and a short delay is expected. The files will be available for validation once processing is complete.',
            'INFORMATION',
            'success',
            () => {
              this.closeDialog();
             
              this.notificationService.setNotificationVisibility(false);
              console.log('Upload successful');
            }
          );
        },
        (error) => {
          this.loading = false
          this.notificationService.showNotification(
        
            'Something went wrong while uploading your files. Please try again.',
            'Processing Error',
            'error',
            () => {
             
              console.log('Upload error');
            }
          );
        }
      );
    } else {
      // No files selected error
      this.loading = false
      this.notificationService.showNotification(
        'Please select at least one file before proceeding.',
        'File Required',
        'error',
        () => {
          console.log('No files selected');
        }
      );
    }
  }
  
  }

   