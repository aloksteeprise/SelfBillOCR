import { Component, Inject, OnInit,ViewChild  } from '@angular/core';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {environment} from '../constant/api-constants';
import { NotificationPopupService } from '../notification-popup/notification-popup.service';
import { DownloadPdfService } from '../service/downlaodPdf.service';
//import { SharedModule } from '../shared/shared.module';
import { SharedUtils  } from '../shared/shared-utils';
import { ConfirmationPopComponent } from '../confirmation-pop/confirmation-pop.component';



@Component({
  selector: 'app-afsinvoice',
  templateUrl: './afsinvoice.component.html',
  styleUrls: ['./afsinvoice.component.css']
})
export class AfsinvoiceComponent implements OnInit {
  @ViewChild('myForm') myForm: any;
  @ViewChild(ConfirmationPopComponent) popupComponent!: ConfirmationPopComponent;
  id:number = 0;
  conCode:string="";
  contractorname: string = '';
  afscontractor: string = '';
  afsContract: string = '';
  firstnamefor:string = '';
  lastnamefor:string = '';
  startdate: string = '';
  enddate: string = ''; 
  totalAmount: string = ''; 
  invoiceNumber: string = '';
  invoiceDate: string = '';
  groupNewId: string = '';
  imageName: string = '';
  thumbImage: string = '';
  fullImagePath: string = '';
  contractorOptions: { id: number; firstName: string; lastName: string;fullName: string; conCode:string; }[] = []; // For first dropdown
  filteredContractOptions: { id: number; name: string }[] = []; // For filtered second dropdown
  //selectedContract: string = ''; // Holds the selected contractor from the first dropdown
  selectedContract: any = null; // Holds the selected contractor object
  selectedFilteredContract: string = ''; // Holds the selected filtered contract from the second dropdown
  isPopupVisible: boolean = true;
  ctcCode: number = 0;
  gridCtcCode: number = 0;
  submitted = false;
  errors: any = {};
  IsContractIsActiveOrNot:any;
  imageWidth: number = 792;
  imageHeight: number = 490;
  pdfFileName:string="";
  uplodedPDFFile:string="";
  loading: boolean = false;
  isNotificationVisible: boolean = false
  currencytype :string='';
  token: string = '';
  contract_CtcCode:string='';


  constructor(
    private dialogRef: MatDialogRef<AfsinvoiceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient, // Injecting HttpClient service
    public notificationService: NotificationPopupService,
    private downloadPdfService: DownloadPdfService
  ) 
  {
    this.setImagePath(data.invoiceFilePath, data.invoiceFileName);
  }

  setImagePath(filePath: string, pdfFile: string): void {
    
    this.imageName = filePath;
    this.uplodedPDFFile =pdfFile;
    this.thumbImage = `assets/documents/pdf/${this.imageName}`;
    this.fullImagePath = `assets/documents/pdf/${this.imageName}`;
    
    this.pdfFileName =`assets/documents/processed-pdf/${this.uplodedPDFFile}`;

    //image with good readibility
    // this.thumbImage = `assets/documents/pdf/La fosse - SB-209461_Image20241126_120950.png`;
    // this.fullImagePath = `assets/documents/pdf/La fosse - SB-209461_Image20241126_120950.png`;

    // this.thumbImage = `assets/documents/pdf/invoice_18_04_2024_2_Image20241129_122116.png`;
    // this.fullImagePath = `assets/documents/pdf/invoice_18_04_2024_2_Image20241129_122116.png`;
  
    console.log('Thumb Image:', this.thumbImage);
    console.log('Full Image Path:', this.fullImagePath);

    console.log('Full pdfFileName  Path:', this.pdfFileName);
  }
  
  

  ngOnInit(): void {

    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.token = storedToken; 
    } else {
      console.error('Token not found in localStorage.');
     
    }
       
    this.initializeFormData();
    this.fetchContractorOptions();
  }

  initializeFormData(): void {
    if (this.data) {
      console.log(this.data);
    
  
      //alert(this.data.contract_CtcContractor);
      this.id = this.data.id;
      this.conCode = this.data.contract_CtcContractor || '';
      this.contractorname = this.data.contractorName || '';
      this.afscontractor = this.data.afscontractor || '';
      this.firstnamefor = this.data.cFirstName || '';
      this.lastnamefor = this.data.cLastName || '';
      this.startdate = this.data.startDate || '';
      this.enddate = this.data.endDate || '';
      this.IsContractIsActiveOrNot = this.data.errorMessage;
      this.currencytype = this.data.currencyType || '';
      
      // Remove currency 
      this.totalAmount = this.data.totalAmount.includes(' ') ? this.data.totalAmount.split(' ')[0] : this.data.totalAmount.trim();
      //this.totalAmount = this.data.totalAmount ? (this.data.totalAmount.includes(' ') ? this.data.totalAmount.split(' ')[0] : this.data.totalAmount.trim()) : ''; // Ensure a default empty string if totalAmount is undefined
      this.invoiceNumber = this.data.selfBillInvoiceNo || '';
      this.invoiceDate = this.data.selfBillInvoiceDate || '';
      this.groupNewId = this.data.grouP_NEWID || '';
      this.gridCtcCode = this.data.contract_CtcCode || 0;
       this.contract_CtcCode = this.data.contract_CtcCode || '';

      console.log(this.ctcCode);
    }
  }

  fetchContractorOptions(): void {
    
    //const apiUrl = 'https://localhost:44337/api/OCRAI/GetContractorContractListByConName'; // Replace with your API URL

    const apiUrl = environment.API_BASE_URL+'OCRAI/GetContractorContractListByConName';
    // Sending request to API
    let searchFullName="";
    if(this.gridCtcCode >0){
      searchFullName = this.firstnamefor + ' ' + this.lastnamefor;
    }
    else{
      searchFullName= this.contractorname ;
    }
    
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const body = {
      firstNameForAFS: this.firstnamefor,
      lastNameForAFS: this.lastnamefor,
      fullName: searchFullName,
    };

    this.http.post<any>(apiUrl,body, {headers }).subscribe(
      (response) => {
        // Assign the list of contractors to the dropdown options
        if (response?.data?.contractsList) {
          
          // Store the entire contractsList in localStorage
          localStorage.setItem('contractsList', JSON.stringify(response.data.contractsList));
          this.contractorOptions = response.data.contractsList.map((item: any) => ({
            id: item.ctcCode, // Use ctcCode as ID
            conCode:item.conCode,
            firstName: item.conFirstName, // Use conFirstName for dropdown display
            lastName:item.conLastName,
            fullName:item.fullName
          }));

          //Set the selected contract if `this.gridCtcCode` matches any option's `id`
           if(this.conCode)
            {
              this.selectedContract = this.contractorOptions.find(
                (option) => option.conCode  == this.conCode
              );
            }
            else{
              this.selectedContract = this.contractorOptions.find(
                (option) => option.conCode.length >0
              );
            }
            
          if(this.selectedContract && this.selectedContract.conCode){
             this.conCode =this.selectedContract.conCode;
             this.filterContractData();
          }   
          
          
        }
      },
      (error) => {
        console.error('Error fetching contractor options:', error);
      }
    );
  }
  
  onImageLoad(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
  
    if (imgElement && imgElement.naturalWidth && imgElement.naturalHeight) {
      this.imageWidth = imgElement.naturalWidth > 792 ? imgElement.naturalWidth : 792; // Ensure a minimum width of 492
      this.imageHeight = imgElement.naturalHeight > 492 ? imgElement.naturalHeight : 492; // Ensure a minimum height of 492
    }
  }

  // Filter contractor data and bind it to the second dropdown
  filterContractData(): void {
    console.log('Selected Contractor:', this.selectedContract);
    // Clear the previous filtered options
    this.filteredContractOptions = [];
    this.selectedFilteredContract = '';

   //alert( this.IsContractIsActiveOrNot);
    if (this.selectedContract) {
      this.errors.selectedContract = undefined;
    }


//ToDO API Call

const apiUrl = environment.API_BASE_URL+'OCRAI/GetContractorActiveContract';
// Sending request to API
//const apiUrl = 'https://localhost:44337/api/OCRAI/GetContractorActiveContract'; // Replace with your API URL
console.log(apiUrl);
console.log('this.ctcCode');
console.log(this.ctcCode);

const headers = new HttpHeaders({
  Authorization: `Bearer ${this.token}`,
  'Content-Type': 'application/json',
});

const body = {
  CtcCode: this.conCode
};

this.http.post<any>(apiUrl,body, { headers}).subscribe(
  (response) => {
    // Assign the list of contractors to the dropdown options
    console.log('GetContractorActiveContract API');
    console.log(response);
    if (response?.data?.contractsList) {
      
     //console.log(response?.data?.contractsList);
     let contractsListItems =response?.data?.contractsList;
     console.log('this.selectedContract');
     console.log(this.selectedContract);
       if (contractsListItems && this.selectedContract) {
        // Filter and map contracts
        //this.IsContractIsActiveOrNot="";
        this.filteredContractOptions = contractsListItems
            .filter((contract: any) => contract.conCode === this.selectedContract.conCode && contract.contracts.includes('Active'))
            .map((item: any) => ({
                id: item.ctcCode,
                name: item.contracts // Assuming "contracts" field is what you want to display
            }));       
          console.log('this.filteredContractOptions');
          console.log(this.filteredContractOptions);
          // Select the first record by default
          if (this.filteredContractOptions.length > 0) {
              this.selectedFilteredContract = this.filteredContractOptions[0].name;
              this.errors.selectedFilteredContract = undefined;
          }

          //changeName As per Contractor Change
          
          let changeNameAsperContractorChange =contractsListItems
          .filter((contract: any) => contract.conCode === this.selectedContract.conCode && contract.contracts.includes('Active'));       

          if(changeNameAsperContractorChange !=undefined && changeNameAsperContractorChange[0] != undefined){
            this.firstnamefor = changeNameAsperContractorChange[0].conFirstName;
            this.lastnamefor = changeNameAsperContractorChange[0].conLastName;

            console.log(this.firstnamefor);
            console.log(this.lastnamefor);
          }
    }
    }
  },
  (error) => {
    console.error('Error fetching contractor options:', error);
  }
);


    // Retrieve the contracts list from localStorage
    // const storedContractsList = JSON.parse(localStorage.getItem('contractsList')!);

    // console.log(storedContractsList);

    // if (storedContractsList && this.selectedContract) {
    //     // Filter and map contracts
    //     //this.IsContractIsActiveOrNot="";
    //     this.filteredContractOptions = storedContractsList
    //         .filter((contract: any) => contract.fullName === this.selectedContract.fullName && contract.contracts.includes('Active'))
    //         .map((item: any) => ({
    //             id: item.ctcCode,
    //             name: item.contracts // Assuming "contracts" field is what you want to display
    //         }));       
            
    //       // Select the first record by default
    //       if (this.filteredContractOptions.length > 0) {
    //           this.selectedFilteredContract = this.filteredContractOptions[0].name;
    //           this.errors.selectedFilteredContract = undefined;
    //       }

    //       //changeName As per Contractor Change
    //       let changeNameAsperContractorChange =storedContractsList
    //       .filter((contract: any) => contract.fullName === this.selectedContract.fullName && contract.contracts.includes('Active'));       

    //       if(changeNameAsperContractorChange !=undefined && changeNameAsperContractorChange[0] != undefined){
    //         this.firstnamefor = changeNameAsperContractorChange[0].conFirstName;
    //         this.lastnamefor = changeNameAsperContractorChange[0].conLastName;

    //         console.log(this.firstnamefor);
    //         console.log(this.lastnamefor);
    //       }
    // }
}

 // Clear validation error for a specific field
 clearValidation(field: string) {
  if ((this as any)[field]?.trim() !== '') {
    this.errors[field] = null;
  }
}


onPrevious() {
  this.loading = true;
  const errors: any = {};
  this.errors = errors;
  this.notificationService.setNotificationVisibility(false);

  const formData = {
    RowId: this.id,
    FirstName: this.firstnamefor,
    LastName: this.lastnamefor,
    StartDate: this.startdate,
    EndDate: this.enddate,
    GroupNewId: this.groupNewId,
    IsSkip: false,
    IsPrevious: true, 
    IsDelete: false,
  };

  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
    'Content-Type': 'application/json',
  });

  const apiUrl = environment.API_BASE_URL + 'OCRAI/ValidateAndMapToContractorContract';
  this.http.post<any>(apiUrl, formData, { headers }).subscribe({
    next: (response) => {
      this.loading = false;

      if (response.data.resultTable.length > 0) {
        const previousRecord = response.data.resultTable[0];

        if (previousRecord.Message === 'No previous record') {
          this.notificationService.showNotification(
            'There are no previous record avaiable. Please Skip action.',
            'INFO',
            'info',
            () => {
              this.notificationService.setNotificationVisibility(false);
            }
          );
        } else {
          this.fetchNextRecord(previousRecord);
          this.notificationService.setNotificationVisibility(false);
        }
      } else {
        this.notificationService.showNotification(
          'No more records to process.',
          'INFO',
          'info',
          () => {
            this.dialogRef.close();
            this.notificationService.setNotificationVisibility(false);
          }
        );
      }
    },
    error: (error) => {
      this.loading = false;
      this.notificationService.showNotification(
        'Unable to retrieve the previous record. Please retry.',
        'ERROR',
        'error',
        () => {
          this.notificationService.setNotificationVisibility(false);
        }
      );
    },
  });

}


onDelete() {
  this.popupComponent.openPopup(
    'Confirmation',
    'Are you sure that you want to proceed?',
    'warning',
    () => {

  this.loading = true;
  this.errors = {};
  this.notificationService.setNotificationVisibility(false);

  const formData = {
    RowId: this.id,
    FirstName: this.firstnamefor,
    LastName: this.lastnamefor,
    StartDate: this.startdate,
    EndDate: this.enddate,
    GroupNewId: this.groupNewId,
    IsSkip: false,
    IsPrevious: false, 
    IsDelete: true
  };

  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
    'Content-Type': 'application/json',
  });

  const apiUrl = environment.API_BASE_URL + 'OCRAI/ValidateAndMapToContractorContract';
  this.http.post<any>(apiUrl, formData, { headers }).subscribe({
    next: (response) => {
      this.loading = false;

      if (response?.data?.resultTable?.length > 0) {
        const previousRecord = response.data.resultTable[0];
        this.fetchNextRecord(previousRecord);
      }

      // ✅ Show success notification after successful deletion
      this.notificationService.showNotification(
        'Record has been successfully deleted. Retrieving the next record.',
        'SUCCESS',
        'success',
        () => {
          this.notificationService.setNotificationVisibility(false);
        }
      );
    },
    error: (error) => {
      this.loading = false;
      console.error("Error in deletion:", error);
      this.notificationService.showNotification(
        'Unable to delete the record. Please retry.',
        'ERROR',
        'error',
        () => {
          this.notificationService.setNotificationVisibility(false);
        }
      );
    },
  });
  })
}




onSkip() {
  this.loading = true;
  const errors: any = {};
  this.errors = errors; 
  this.notificationService.setNotificationVisibility(false);
  

  const formData = {
    RowId: this.id,
    FirstName: this.firstnamefor,
    LastName: this.lastnamefor,
    StartDate: this.startdate,
    EndDate: this.enddate,
    totalAmount : this.totalAmount,
    invoiceNumber : this.invoiceNumber,
    invoiceDate : this.invoiceDate,
    GroupNewId: this.groupNewId,
    IsSkip: true,
  };
  
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
    'Content-Type': 'application/json',
  });

  const apiUrl = environment.API_BASE_URL + 'OCRAI/ValidateAndMapToContractorContract';
  this.http.post<any>(apiUrl, formData,{headers}).subscribe({
    next: (response) => {
      this.loading = false;
      //this.notificationService.setNotificationVisibility(true);
      if (response.data.resultTable.length > 0) {
        const nextRecord = response.data.resultTable[0];
        
        if (nextRecord.Message === 'All rows complete') {
          this.notificationService.showNotification(
            'All records have been processed.',
            'INFORMATION',
            'success',
            () => {
              this.dialogRef.close();
              this.notificationService.setNotificationVisibility(false);
            }
          );
        } else {
          this.fetchNextRecord(nextRecord);
          this.notificationService.setNotificationVisibility(false);
        
        }
      } else {
        this.notificationService.showNotification(
          'No more records to process.',
          'INFO',
          'info',
          () => {
            this.dialogRef.close();
            this.notificationService.setNotificationVisibility(false);
          }
        );
      }
    },
    error: (error) => {
      this.loading = false;
      this.notificationService.showNotification(
        'Unable to complete the skip action. Please retry.',
        'ERROR',
        'error',
        () => {
          this.notificationService.setNotificationVisibility(false);
        }
      );
    },
  });
}
// validateStartDate(): void {
//   const today = new Date(this.getToday());
//   const inputDate = new Date(this.startdate);

//   if (!this.startdate) {
//     this.errors.startDate = "Start date is required.";
//   } else if (isNaN(inputDate.getTime())) {
//     this.errors.startDate = "Invalid date format. Please enter a valid date.";
//   } else if (inputDate > today) {
//     this.errors.startDate = "Start date cannot be in the future.";
//   } else {
//     this.errors.startDate = null; // Clear the error
//   }
// }


onSubmit(form: any): void {
 
  this.submitted = true; 
  let isValid = true;
  const errors: any = {};
  // const today = new Date(this.getToday());
  // const inputDate = new Date(this.startdate);
  // const inputDate2 = new Date(this.enddate);

  
  if (!this.selectedContract) {
    errors.selectedContract = 'AFS Contractor is required.';
    isValid = false;
  }

  if (!this.selectedFilteredContract) {
    errors.selectedFilteredContract = 'AFS Contract is required.';
    isValid = false;
  }

  if (!this.firstnamefor || this.firstnamefor.trim() === '') {
    errors.firstName = 'First Name is required.';
    isValid = false;
  }

  if (!this.lastnamefor || this.lastnamefor.trim() === '') {
    errors.lastName = 'Last Name is required.';
    isValid = false;
  }

  // if (!this.startdate || this.startdate.trim() === '') {
  //   errors.startDate = 'Start Date is required.';
  //   isValid = false;
  // } else if (isNaN(inputDate.getTime())) {
  //   errors.startDate = 'Invalid date format. Please enter a valid date.';
  //   isValid = false;
  // } else if (inputDate > today) {
  //   errors.startDate = 'Start Date cannot be in the future.';
  //   isValid = false;
  // }
  
  const startDate = SharedUtils.validateDate(this.startdate, 'Start Date', true);
    if (startDate) {
      isValid = false;
      errors.startDate = startDate; }

  const endDate = SharedUtils.validateDate(this.enddate, 'End Date', true);
  if (endDate) {
    isValid = false;
    errors.endDate = endDate; }

  const invoiceDate = SharedUtils.validateDate(this.invoiceDate, 'Invoice Date', false);
  if (invoiceDate) {
    isValid = false;
    errors.invoiceDate = invoiceDate; }

  // if (!this.enddate || this.enddate.trim() === '') {
  //   errors.endDate = 'End Date is required.';
  //   isValid = false;
  // }

  // if (!this.enddate || this.enddate.trim() === '') {
  //   errors.endDate = 'End Date is required.';
  //   isValid = false;
  // } else if (isNaN(inputDate2.getTime())) {
  //   errors.endDate = 'Invalid date format. Please enter a valid date.';
  //   isValid = false;
  // } else if (inputDate2 > today) {
  //   errors.endDate = 'End Date cannot be in the future.';
  //   isValid = false;
  // }


  if (this.startdate && this.enddate) {
    const startDateObj = new Date(this.startdate);
    const endDateObj = new Date(this.enddate);

    if (startDateObj > endDateObj) {
      errors.dateComparison = 'Start Date cannot be greater than End Date.';
      isValid = false;
    }
  }
  this.errors = errors; // Assign errors to the class property
  //alert(form);

  if (isValid) {
    const formData = {
      RowId: this.id,
      FirstName: this.firstnamefor,
      LastName: this.lastnamefor,
      StartDate: this.startdate,
      EndDate: this.enddate,
      GroupNewId: this.groupNewId,
      IsSkip:false
    };

    console.log('formData:', formData);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    //const apiUrl = 'https://localhost:44337/api/OCRAI/ValidateAndMapToContractorContract';
    const apiUrl = environment.API_BASE_URL+'OCRAI/ValidateAndMapToContractorContract';
    this.http.post<any>(apiUrl, formData,{headers}).subscribe({
      next: (response) => {
       //response.data.validationResult = -1
       
        switch (response.data.validationResult) {
          case -1:
            
            //alert('Erro r occurred in validation process.');

            this.notificationService.showNotification(
              'Error occurred in validation process.',
              'ERROR',
              'error',
              () => {
                // this.dialogRef.close();
                console.log('OK clicked!'); // Callback logic
                this.notificationService.setNotificationVisibility(false);

              }
            );
            break;
  
          case 1:
            //alert('No row validated.');
            //this.fetchNextRecord(response.data.resultTable[0]);
            this.notificationService.showNotification(
              'No row validated.',
              'INFORMATION',
              'success',
              () => {
                console.log('OK clicked 1'); // Callback logic
                console.log('response');
                console.log(response);
                //this.fetchNextRecord(response.data.resultTable[0]);
                if(response.data.resultTable.length >0){
                  this.fetchNextRecord(response.data.resultTable[0]);
                }
              }
            );
            break;
  
          case 2:
            //alert('The records have been successfully validated and moved.');
            //this.fetchNextRecord(response.data.resultTable[0]);
            this.notificationService.showNotification(
              'The records have been successfully validated and moved.',
              'INFORMATION',
              'success',
              () => {
                console.log('OK clicked 2'); // Callback logic
                console.log('response');
                console.log(response);
                //this.fetchNextRecord(response.data.resultTable[0]);
                if(response.data.resultTable.length >0){
                  this.fetchNextRecord(response.data.resultTable[0]);
                }
              }
            );
            break;
  
          case 3:
            //alert('Error in validation process.');
            //this.fetchNextRecord(response.data.resultTable[0]);
           
            this.notificationService.showNotification(
              'Error in validation process.',
              'ERROR',
              'error',
              () => {
                console.log('OK clicked 3'); // Callback logic
                console.log('response');
                console.log(response);
                //this.fetchNextRecord(response.data.resultTable[0]);
                if(response.data.resultTable.length >0){
                  this.fetchNextRecord(response.data.resultTable[0]);
                }
                this.notificationService.setNotificationVisibility(false);
              }
            );
            break;
  
          case 4:
            console.log("case 4 is clicked ")
            //alert('The records have been successfully validated and moved.');
            //this.fetchNextRecord(response.data.resultTable[0]);
        
            this.notificationService.showNotification(
              'The records have been successfully validated and moved.',
              'INFORMATION',
              'success',
              () => {
         

                console.log('OK clicked 4'); // Callback logic
                console.log('response' + response.data.resultTable.length);
                console.log(response);
                if(response.data.resultTable.length >0){
                  this.fetchNextRecord(response.data.resultTable[0]);
                }
                this.notificationService.setNotificationVisibility(false);
              }
            );
            break;


            case 5:
              console.log("case 5 is clicked ")
              //alert('The records have been successfully validated and moved.');
              //this.fetchNextRecord(response.data.resultTable[0]);
          
              this.notificationService.showNotification(
                'The selected period must fall within the contracts start and end dates.',
                'INFORMATION',
                'success',
                () => {
                 
  
                  console.log('OK clicked 5'); // Callback logic
                  console.log('response' + response.data.resultTable.length);
                  console.log(response);
                  if(response.data.resultTable.length >0){
                    this.fetchNextRecord(response.data.resultTable[0]);
                  }
                  this.notificationService.setNotificationVisibility(false);
                }
              );
              break;

              case 6:
              console.log("case 5 is clicked ")
              //alert('The records have been successfully validated and moved.');
              //this.fetchNextRecord(response.data.resultTable[0]);
          
              this.notificationService.showNotification(
                'The selected timesheet period is already registered in the contract.',
                'INFORMATION',
                'success',
                () => {
                 
  
                  console.log('OK clicked 5'); // Callback logic
                  console.log('response' + response.data.resultTable.length);
                  console.log(response);
                  if(response.data.resultTable.length >0){
                    this.fetchNextRecord(response.data.resultTable[0]);
                  }
                  this.notificationService.setNotificationVisibility(false);
                }
              );
              break;

             

  
          default:
            this.notificationService.showNotification(
              'Unhandled validation result:',
              'WARNING',
              'Warning',
              () => {
                console.log('OK clicked default'); 
                this.notificationService.setNotificationVisibility(false);
              }
            );
            //console.warn('Unhandled validation result:', response.data.validationResult);
            break;
        }
      },
      error: (error) => {
        //console.error('API Error:', error);
        //alert('There was an error submitting the form. Please try again.');
        this.notificationService.showNotification(
          'There was an error submitting the form. Please try again.',
          'ERROR',
          'error',
          () => {
            console.log('OK clicked error'); // Callback logic
          }
        );
      },
    });
  } 
  // else {
  //   alert('Please fill out all required fields.');
  // }
}

fetchNextRecord(data: any): void {
console.log("this.id" + this.id);

  this.id = data.ID;
  this.conCode = data.Contract_CtcContractor || '';
  this.contractorname ='';
  this.contractorname = data.ContractorName || '';
  this.afscontractor = data.afscontractor || '';
  this.firstnamefor = data.CFirstName || '';
  this.lastnamefor = data.CLastName || '';
  this.startdate = data.StartDate || '';
  this.enddate = data.EndDate || '';
  // this.totalAmount = this.data.totalAmount ? (this.data.totalAmount.includes(' ') ? this.data.totalAmount.split(' ')[0] : this.data.totalAmount.trim()) : ''; // Ensure a default empty string if totalAmount is undefined
  this.totalAmount = data.TotalAmount?.includes(' ') ? data.TotalAmount.split(' ')[0] : data.TotalAmount?.trim() || '';  this.invoiceNumber = data.SelfBillInvoiceNo || '';
  this.invoiceDate = data.SelfBillInvoiceDate || '';
  this.contract_CtcCode = data.Contract_CtcCode || '';

  this.groupNewId = data.GROUP_NEWID || '';
  this.gridCtcCode = data.Contract_CtcCode || 0;
  this.currencytype = data.CurrencyType || '';
  this.imageName = data.InvoiceFilePath;
  this.uplodedPDFFile = data.InvoiceFileName;
  this.resetAFSContractorDropdown();
  this.fetchContractorOptions();
  this.resetAFSContractDropdown();
  this.setImagePath(this.imageName, this.uplodedPDFFile);
  this.IsContractIsActiveOrNot = data.ErrorMessage;
  
  
  // alert(this.data.errorMessage);
  // alert(this.IsContractIsActiveOrNot);
}

resetAFSContractorDropdown(): void {
  this.selectedContract = ''; // Clear the selected value
  this.contractorOptions = []; // Clear the list of options
}


resetAFSContractDropdown(): void {
  this.selectedFilteredContract = ''; // Clear the selected value
  this.filteredContractOptions = []; // Clear the list of options
}
  submitForm(): void {
    if (this.myForm) {
      this.myForm.ngSubmit.emit();
    }
  }


  isModalOpen = true; // Controls modal visibility

  // Method to close modal
  // closeModal() {
  //   // Hide the modal using Bootstrap's class manipulation
  //   const modal = document.getElementById('exampleModal');
  //   if (modal) {
  //     modal.classList.remove('d-block');
  //     modal.classList.add('d-none'); // Optional: Add a 'hidden' style
  //   }

  //   // Reset opacity if modified
  //   const modalContent = modal?.querySelector('.modal-content');
  //   if (modalContent) {
  //     modalContent.setAttribute('style', '');
  //   }
    
  // }

  closeDialog(): void {
    this.dialogRef.close(); 
  }

  downloadPdfFile(data: any) {
    console.log(data);
    const fileUrl = environment.API_BASE_URL +`assets/documents/processed-pdf/${data.InvoiceFileName}`;; // Replace with your API endpoint

    this.downloadPdfService.downloadPdf(fileUrl).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'file.pdf'; // Specify the file name
      link.click();
      window.URL.revokeObjectURL(url); // Clean up
    });
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0]
 }

  onContractorNameBlur(): void {
      console.log('Contractor Name field lost focus:', this.contractorname);
      this.loading =true;
      if (this.contractorname) { 
          //re-bind the drop-downs
          this.fetchContractorOptions();
      }
      this.loading =false;
  }

}
