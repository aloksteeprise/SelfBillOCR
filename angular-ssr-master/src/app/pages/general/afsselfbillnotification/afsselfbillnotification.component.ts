import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../constant/api-constants';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationPopupService } from '../notification-popup/notification-popup.service';

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
      //fileData.append('token', this.token);

      this.http.post<any>('https://localhost:44337/api/SelfBillNotification/UploadSelfBillFile', fileData).subscribe(
        (response) => {
          // this.id = response.id || '';
          // this.contractorName = response.contractorName || '';
          // this.afscontractor = response.afscontractor || '';
          // this.firstName = response.firstName || '';
          // this.lastName = response.lastName || '';
          // this.startDate = response.startDate || '';
          // this.endDate = response.endDate || '';
          // this.totalAmount = response.totalAmount || '';
          // this.invoiceNumber = response.invoiceNo || '';
          // this.invoiceDate = response.invoiceDate || '';
          // this.groupNewId = response.grouP_NEWID || '';
          // this.gridCtcCode = response.contract_CtcCode || 0;

          // this.fetchContractorOptions();
          // this.isFileUploadVisible = false;
          // this.isPopupVisible = true;

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

