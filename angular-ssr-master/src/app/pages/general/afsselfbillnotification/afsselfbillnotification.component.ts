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
    this.loading = true;
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
      } else {
        invalidFiles.push(file.name);
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
          this.notificationService.showNotification(
            'Your files have been uploaded successfully!',
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

    // clearValidation(field: string) {
  //   if ((this as any)[field]?.trim() !== '') {
  //     this.errors[field] = null;
  //   }
  // }

  // onSkip(){
  //   this.isFileUploadVisible = true;
  //   this.isPopupVisible = false;
  // }

  // onImageLoad(event: Event): void {
  //   const imgElement = event.target as HTMLImageElement;

  //   if (imgElement && imgElement.naturalWidth) {
  //     this.imageWidth = imgElement.naturalWidth;
  //   }
  // }
  
  // fetchContractorOptions(): void {

  //   const apiUrl = environment.API_BASE_URL+'OCRAI/GetContractorContractListByConName';

  //   this.http.post<any>(apiUrl, { firstNameForAFS: this.firstName,lastNameForAFS:this.lastName,fullName: this.contractorName }).subscribe(
  //     (response) => {
  //       if (response?.data?.contractsList) {

  //         localStorage.setItem('contractsList', JSON.stringify(response.data.contractsList));
  //         this.contractorOptions = response.data.contractsList.map((item: any) => ({
  //           id: item.ctcCode, // Use ctcCode as ID
  //           firstName: item.conFirstName, // Use conFirstName for dropdown display
  //           lastName:item.conLastName,
  //           fullName:item.fullName
  //         }));

  //         this.selectedContract = this.contractorOptions.find(
  //           (option) => option.id === Number(this.gridCtcCode)
  //         );

  //         if (this.selectedContract) {
  //           this.filterContractData();
  //         }
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching contractor options:', error);
  //     }
  //   );
  // }

  // filterContractData(): void {
  //   console.log('Selected Contractor:', this.selectedContract);
  //   this.filteredContractOptions = [];
  //   this.selectedFilteredContract = '';
  //   const storedContractsList = JSON.parse(localStorage.getItem('contractsList')!);
  //   if (storedContractsList && this.selectedContract) {
  //     this.filteredContractOptions = storedContractsList
  //       .filter((contract: any) => contract.fullName === this.selectedContract.fullName)
  //       .map((item: any) => ({
  //         id: item.ctcCode,
  //         name: item.contracts
  //       }));

  //       if (this.filteredContractOptions.length > 0) {
  //         this.selectedFilteredContract = this.filteredContractOptions[0].name;
  //     }
  //   }
  // }

  // onSubmit(form: any): void {
  //   this.submitted = true; // Mark the form as submitted
  //   let isValid = true;
  //   const errors: any = {};

  //   if (!this.firstName || this.firstName.trim() === '') {
  //     errors.firstName = 'First Name is required.';
  //     isValid = false;
  //   }

  //   if (!this.lastName || this.lastName.trim() === '') {
  //     errors.lastName = 'Last Name is required.';
  //     isValid = false;
  //   }

  //   if (!this.startDate || this.startDate.trim() === '') {
  //     errors.startDate = 'Start Date is required.';
  //     isValid = false;
  //   }

  //   if (!this.endDate || this.endDate.trim() === '') {
  //     errors.endDate = 'End Date is required.';
  //     isValid = false;
  //   }

  //   if (this.startDate && this.endDate) {
  //     const startDateObj = new Date(this.startDate);
  //     const endDateObj = new Date(this.endDate);

  //     if (startDateObj > endDateObj) {
  //       errors.dateComparison = 'Start Date cannot be greater than End Date.';
  //       isValid = false;
  //     }
  //   }

  //   if (!this.contractorName || this.contractorName.trim() === '') {
  //     errors.contractorName = 'Contractor Name is required.';
  //     isValid = false;
  //   }

  //   if (!this.totalAmount || this.totalAmount === 0) {
  //     errors.totalAmount = 'Total Amount is required.';
  //     isValid = false;
  //   }

  //   if (!this.invoiceNumber || this.invoiceNumber.trim() === '') {
  //     errors.invoiceNumber = 'Invoice Number is required.';
  //     isValid = false;
  //   }

  //   if (!this.invoiceDate || this.invoiceDate.trim() === '') {
  //     errors.invoiceDate = 'Invoice Date is required.';
  //     isValid = false;
  //   }

  //   if (!this.selectedContract) {
  //     errors.selectedContract = 'AFS Contractor is required.';
  //     isValid = false;
  //   }

  //   if (!this.selectedFilteredContract) {
  //     errors.selectedFilteredContract = 'AFS Contract is required.';
  //     isValid = false;
  //   }

  //   this.errors = errors; // Assign errors to the class property

  //   if (isValid) {
  //     const formData = {
  //       RowId: this.id,
  //       FirstName: this.firstName,
  //       LastName: this.lastName,
  //       StartDate: this.startDate,
  //       EndDate: this.endDate,
  //       //GroupNewId: this.groupNewId,
  //     };

  //     console.log('formData:', formData);

  //     //const apiUrl = 'https://localhost:44337/api/OCRAI/ValidateAndMapToContractorContract';
  //   const apiUrl = environment.API_BASE_URL+'OCRAI/ValidateAndMapToContractorContract';

  //     this.http.post<any>(apiUrl, formData).subscribe({
  //       next: (response) => {
  //         switch (response.data.validationResult) {
  //           case -1:
  //             this.notificationService.showNotification(
  //               'Error occurred in validation process.',
  //               'ERROR',
  //               'error',
  //               () => {
  //                 console.log('OK clicked!');
  //                 this.isPopupVisible = true;
  //                 this.isFileUploadVisible = false;
  //               }
  //             );
  //             break;

  //         case 1:
  //           this.notificationService.showNotification(
  //             'No row validated.',
  //             'INFORMATION',
  //             'success',
  //             () => {
  //               console.log('OK clicked 1');
  //               console.log('response');
  //               console.log(response);
  //               this.isPopupVisible = true;
  //               this.isFileUploadVisible = false;
  //             }
  //           );
  //           break;

  //         case 2:
  //           this.notificationService.showNotification(
  //             'The records have been successfully validated and moved.',
  //             'INFORMATION',
  //             'success',
  //             () => {
  //               console.log('OK clicked 2');
  //               console.log('response');
  //               console.log(response);
  //               this.isPopupVisible = false;
  //               this.isFileUploadVisible = true;
  //             }
  //           );
  //           break;

  //         case 3:
  //           this.notificationService.showNotification(
  //             'Error in validation process.',
  //             'ERROR',
  //             'error',
  //             () => {
  //               console.log('OK clicked 3');
  //               console.log('response');
  //               console.log(response);
  //               this.isPopupVisible = true;
  //               this.isFileUploadVisible = false;
  //             }
  //           );
  //           break;

  //         case 4:

  //           this.notificationService.showNotification(
  //             'The records have been successfully validated and moved.',
  //             'INFORMATION',
  //             'success',
  //             () => {
  //               console.log('OK clicked 4');
  //               console.log('response' + response.data.resultTable.length);
  //               console.log(response);
  //               this.isPopupVisible = false;
  //               this.isFileUploadVisible = true;
  //             }
  //           );
  //           break;

  //         default:
  //           this.notificationService.showNotification(
  //             'Unhandled validation result:',
  //             'WARNING',
  //             'Warning',
  //             () => {
  //               console.log('OK clicked default'); 
  //               this.isPopupVisible = true;
  //               this.isFileUploadVisible = false;
  //             }
  //           );
  //           break;
  //         }
  //       },
  //       error: (error) => {
  //         this.notificationService.showNotification(
  //           'There was an error submitting the form. Please try again.',
  //           'ERROR',
  //           'error',
  //           () => {
  //             console.log('OK clicked error');
  //             this.isPopupVisible = true;
  //             this.isFileUploadVisible = false;
  //           }
  //         );
  //       },
  //     });
  //   } 
  // }

  // submitForm(): void {
  //   if (this.myForm) {
  //     this.myForm.ngSubmit.emit();
  //   }
  // }

  // closePopup(): void {
  //   this.isPopupVisible = false; 
  // }


  //   getToday(): string {
  //     return new Date().toISOString().split('T')[0]
  //  }
  //  validateDate(): void {
  //   const today = new Date(this.getToday()).getTime();

  //   if (this.startDate) {
  //     const startDate = new Date(this.startDate).getTime();
  //     if (startDate > today) {
  //       this.errors.startDate = 'Start Date cannot be in the future.';
  //       this.startDate = '';
  //     } 
  //   }
  //   else {
  //     delete this.errors.startDate;
  //   }

  //   if (this.endDate) {
  //     const endDate = new Date(this.endDate).getTime();
  //     if (endDate > today) {
  //       this.errors.endDate = 'End Date cannot be in the future.';
  //       this.endDate = '';
  //     }
  //   }
  //   else {
  //     delete this.errors.endDate;
  //   }
  // }

