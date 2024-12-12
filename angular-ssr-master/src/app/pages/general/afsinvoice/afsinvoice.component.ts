import { Component, Inject, OnInit,ViewChild  } from '@angular/core';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import {environment} from '../constant/api-constants';
import { NotificationPopupService } from '../notification-popup/notification-popup.service';
import { DownloadPdfService } from '../service/downlaodPdf.service';


@Component({
  selector: 'app-afsinvoice',
  templateUrl: './afsinvoice.component.html',
  styleUrls: ['./afsinvoice.component.css']
})
export class AfsinvoiceComponent implements OnInit {
  @ViewChild('myForm') myForm: any;
  
  id:number = 0;
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
  contractorOptions: { id: number; firstName: string; lastName: string;fullName: string; }[] = []; // For first dropdown
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
  pdfFileName:string="";
  uplodedPDFFile:string="";


  constructor(
    private dialogRef: MatDialogRef<AfsinvoiceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient, // Injecting HttpClient service
    private notificationService: NotificationPopupService, // Inject service,
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
    this.initializeFormData();
    this.fetchContractorOptions(); // Fetch API data for dropdown
  }

  initializeFormData(): void {
    if (this.data) {

      console.log(this.data);
      
      this.id = this.data.id;
      this.contractorname = this.data.contractorName || '';
      this.afscontractor = this.data.afscontractor || '';
      this.firstnamefor = this.data.cFirstName || '';
      this.lastnamefor = this.data.cLastName || '';
      this.startdate = this.data.startDate || '';
      this.enddate = this.data.endDate || '';
      this.IsContractIsActiveOrNot = this.data.errorMessage;
      
      // Remove currency 
      this.totalAmount = this.data.totalAmount.includes(' ') ? this.data.totalAmount.split(' ')[0] : this.data.totalAmount.trim();
      this.invoiceNumber = this.data.selfBillInvoiceNo || '';
      this.invoiceDate = this.data.selfBillInvoiceDate || '';
      this.groupNewId = this.data.grouP_NEWID || '';
      this.gridCtcCode = this.data.contract_CtcCode || 0;
      console.log(this.ctcCode);
    }
  }

  fetchContractorOptions(): void {
    
    //const apiUrl = 'https://localhost:44337/api/OCRAI/GetContractorContractListByConName'; // Replace with your API URL
    
    const apiUrl = environment.API_BASE_URL+'OCRAI/GetContractorContractListByConName';
    // Sending request to API
    
    this.http.post<any>(apiUrl, { firstNameForAFS: this.firstnamefor,lastNameForAFS:this.lastnamefor,fullName: this.contractorname }).subscribe(
      (response) => {
        // Assign the list of contractors to the dropdown options
        if (response?.data?.contractsList) {
          
          // Store the entire contractsList in localStorage
          localStorage.setItem('contractsList', JSON.stringify(response.data.contractsList));
          this.contractorOptions = response.data.contractsList.map((item: any) => ({
            id: item.ctcCode, // Use ctcCode as ID
            firstName: item.conFirstName, // Use conFirstName for dropdown display
            lastName:item.conLastName,
            fullName:item.fullName
          }));
          //Set the selected contract if `this.gridCtcCode` matches any option's `id`
          this.selectedContract = this.contractorOptions.find(
            (option) => option.id === Number(this.gridCtcCode)
          );

          if (this.selectedContract) {
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

    // Adjust the imageWidth to the actual width of the loaded image
    if (imgElement && imgElement.naturalWidth) {
      this.imageWidth = imgElement.naturalWidth;  // Set the image width dynamically
    }
  }

  // Filter contractor data and bind it to the second dropdown
  filterContractData(): void {
    console.log('Selected Contractor:', this.selectedContract);

    // Clear the previous filtered options
    this.filteredContractOptions = [];
    this.selectedFilteredContract = '';

    if (this.selectedContract) {
      this.errors.selectedContract = undefined;
      
    }
    // Retrieve the contracts list from localStorage
    const storedContractsList = JSON.parse(localStorage.getItem('contractsList')!);

    console.log(storedContractsList);

    if (storedContractsList && this.selectedContract) {
        // Filter and map contracts
        this.filteredContractOptions = storedContractsList
            .filter((contract: any) => contract.fullName === this.selectedContract.fullName && contract.contracts.includes('Active'))
            .map((item: any) => ({
                id: item.ctcCode,
                name: item.contracts // Assuming "contracts" field is what you want to display
            }));       
            
          // Select the first record by default
          if (this.filteredContractOptions.length > 0) {
              this.selectedFilteredContract = this.filteredContractOptions[0].name;
              this.errors.selectedFilteredContract = undefined;
          }

          //changeName As per Contractor Change
          let changeNameAsperContractorChange =storedContractsList
          .filter((contract: any) => contract.fullName === this.selectedContract.fullName && contract.contracts.includes('Active'));       

          if(changeNameAsperContractorChange !=undefined && changeNameAsperContractorChange[0] != undefined){
            this.firstnamefor = changeNameAsperContractorChange[0].conFirstName;
            this.lastnamefor = changeNameAsperContractorChange[0].conLastName;

            console.log(this.firstnamefor);
            console.log(this.lastnamefor);
          }
          else{
            this.IsContractIsActiveOrNot = 'Contract is not active.';
          }
    }
}

 // Clear validation error for a specific field
 clearValidation(field: string) {
  if ((this as any)[field]?.trim() !== '') {
    this.errors[field] = null;
  }
}


 // Form submission handler
//  onSubmit(form: any): void {
//   this.submitted = true; // Mark the form as submitted
//   if (form.valid) {
//     const formData = {
//       RowId: this.id,
//       FirstName: this.firstnamefor,
//       LastName: this.lastnamefor,
//       StartDate: this.startdate,
//       EndDate: this.enddate,
//       GroupNewId: this.groupNewId,
//     };

//     console.log('formData:', formData);

//     //const apiUrl = 'https://localhost:44337/api/OCRAI/ValidateAndMapToContractorContract';
//     const apiUrl = environment.API_BASE_URL+'OCRAI/ValidateAndMapToContractorContract';
//     this.http.post<any>(apiUrl, formData).subscribe({
//       next: (response) => {
//         switch (response.data.validationResult) {
//           case -1:
//             alert('Error occurred!');
//             break;
  
//           case 1:
//             alert('No rows updated!');
//             this.fetchNextRecord(response.data.resultTable[0]);
//             break;
  
//           case 2:
//             alert('Update successful!');
//             this.fetchNextRecord(response.data.resultTable[0]);
//             break;
  
//           case 3:
//             alert('Error in usp_UpdateContractorInfoInInvoice!');
//             this.fetchNextRecord(response.data.resultTable[0]);
//             break;
  
//           case 4:
//             alert('Contractor info updated!');
//             this.fetchNextRecord(response.data.resultTable[0]);
//             break;
  
//           default:
//             console.warn('Unhandled validation result:', response.data.validationResult);
//             break;
//         }
//       },
//       error: (error) => {
//         console.error('API Error:', error);
//         alert('There was an error submitting the form. Please try again.');
//       },
//     });
//   } 
//   // else {
//   //   alert('Please fill out all required fields.');
//   // }
// }


onSubmit(form: any): void {
  this.submitted = true; // Mark the form as submitted
  let isValid = true;
  const errors: any = {};

  
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

  if (!this.startdate || this.startdate.trim() === '') {
    errors.startDate = 'Start Date is required.';
    isValid = false;
  }

  if (!this.enddate || this.enddate.trim() === '') {
    errors.endDate = 'End Date is required.';
    isValid = false;
  }

  if (this.startdate && this.enddate) {
    const startDateObj = new Date(this.startdate);
    const endDateObj = new Date(this.enddate);

    if (startDateObj > endDateObj) {
      errors.dateComparison = 'Start Date cannot be greater than End Date.';
      isValid = false;
    }
  }
  this.errors = errors; // Assign errors to the class property

  if (isValid) {
    const formData = {
      RowId: this.id,
      FirstName: this.firstnamefor,
      LastName: this.lastnamefor,
      StartDate: this.startdate,
      EndDate: this.enddate,
      GroupNewId: this.groupNewId,
    };

    console.log('formData:', formData);

    //const apiUrl = 'https://localhost:44337/api/OCRAI/ValidateAndMapToContractorContract';
    const apiUrl = environment.API_BASE_URL+'OCRAI/ValidateAndMapToContractorContract';
    this.http.post<any>(apiUrl, formData).subscribe({
      next: (response) => {
        switch (response.data.validationResult) {
          case -1:
            //alert('Error occurred in validation process.');

            this.notificationService.showNotification(
              'Error occurred in validation process.',
              'ERROR',
              'error',
              () => {
                console.log('OK clicked!'); // Callback logic
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
              }
            );
            break;
  
          case 4:
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
console.log(data);
  this.id = data.ID;
  this.contractorname ='';
  this.contractorname = data.ContractorName || '';
  this.afscontractor = data.afscontractor || '';
  this.firstnamefor = data.CFirstName || '';
  this.lastnamefor = data.CLastName || '';
  this.startdate = data.StartDate || '';
  this.enddate = data.EndDate || '';
  this.totalAmount = data.TotalTaxAmount?.includes(' ') ? data.TotalTaxAmount.split(' ')[0] : data.TotalTaxAmount?.trim() || '';
  this.invoiceNumber = data.SelfBillInvoiceNo || '';
  this.invoiceDate = data.SelfBillInvoiceDate || '';
  this.groupNewId = data.GROUP_NEWID || '';
  this.gridCtcCode = data.Contract_CtcCode || 0;
  this.imageName = data.InvoiceFilePath;
  this.resetAFSContractorDropdown();
  this.fetchContractorOptions();
  this.resetAFSContractDropdown();
  this.setImagePath(this.imageName, this.uplodedPDFFile);
  this.IsContractIsActiveOrNot = this.data.errorMessage;
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
    this.dialogRef.close(); // Closes the dialog
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
}
