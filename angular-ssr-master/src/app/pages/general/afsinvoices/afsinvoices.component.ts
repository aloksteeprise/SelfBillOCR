import { Component, OnInit, ViewChild, AfterViewInit, input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ApiService } from '../afsinvoices/afsinvoices.service';
import { afsInvoice } from '../afsinvoices/afsinvoices.model';
import { MatDialog } from '@angular/material/dialog';
// import { AfsInvoicesPopupComponent } from '../afs-invoices-popup/afs-invoices-popup.component';
import { AfsinvoiceComponent } from '../afsinvoice/afsinvoice.component';
import { ConfirmationPopComponent } from '../confirmation-pop/confirmation-pop.component';
import {environment} from '../constant/api-constants';
import { NotificationPopupService } from '../notification-popup/notification-popup.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BreakpointObserver } from '@angular/cdk/layout';
import {AfsselfbillnotificationComponent} from '../afsselfbillnotification/afsselfbillnotification.component';

@Component({
  selector: 'app-afsinvoices',
  templateUrl: './afsinvoices.component.html',
  styleUrls: ['./afsinvoices.component.css'],
})

export class AfsInvoicesComponent implements OnInit, AfterViewInit {

  @ViewChild(ConfirmationPopComponent) popupComponent!: ConfirmationPopComponent;
  displayedColumns: string[] = [
    'contractorName',
    'cFirstName',
    'cLastName',
    'startDate',
    'endDate',
    'totalAmount',
    'selfBillInvoiceNo',
    'errorMessage',
    'afsInvoiceStatus',
    'isExpenseOrTimesheet',
    'actions',
    // 'CsmTeam'
  ];

  dataSource = new MatTableDataSource<afsInvoice>([]);
  totalRecords: number = 0;
  pageIndex: number = 0;
  pageSize: number = 20;
  filterValue: string = '';
  name: string = '';
  invoiceno: string = '';
  startdate: string = '';
  enddate: string = '';
  IsValidatedRecord = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  tokenData: string = '';
  token: string = '';
  loading: boolean = false;
  isNotificationVisible: boolean = false;
  IsSelfBill:boolean=false;
  // CsmTeam:string='';
  CsmTeam: any | null = null;
  csmTeamarr: any[] = [];
  IsAllRecord: boolean = false; 
  selectedRecords: number[] = []; 
  allRecords: any[] = []; // Ensure this holds all records loaded in the table
  isChecked = false;
  hideCheckBoxes: boolean = true; // Default: Show checkboxes
  isMovedInOriginaldb : boolean = true;
  IsCompleteRecord:boolean =false;

  constructor(private apiService: ApiService, private dialog: MatDialog,  public notificationService: NotificationPopupService,private http: HttpClient,private breakpointObserver: BreakpointObserver ) { }

  ngOnInit() {

    this.breakpointObserver.observe(['(max-width: 700px)']).subscribe((result) => {
      if (result.matches) {
        // Mobile view: Show "actions" first
         this.displayedColumns = [
           'actions',
    'contractorName',
    'cFirstName',
    'cLastName',
    'startDate',
    'endDate',
    'totalAmount',
    'selfBillInvoiceNo',
    'errorMessage',
    'afsInvoiceStatus',
    'isExpenseOrTimesheet'
   
  ];

      } else {
        // Desktop view: Default order
        this.displayedColumns = [
          'contractorName',
          'cFirstName',
          'cLastName',
          'startDate',
          'endDate',
          'totalAmount',
          'selfBillInvoiceNo',
          'errorMessage',
          'afsInvoiceStatus',
          'isExpenseOrTimesheet',
          'CsmTeam',
          'actions',
        
        ];
      }
    });

    //Assigning the token here 

    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.token = storedToken; 
    } else {
      console.error('Token not found in localStorage.');
     
    }

    this.loadInvoices(); 
    this.getCsmTeam();
  }

  ngAfterViewInit() {

    this.sort.sortChange.subscribe(() => {

      this.pageIndex = 0; 
      this.loadInvoices(); 
    });
  }

  loadInvoices() {
    this.loading = true; 
    const SortColumn = this.sort?.active || ''; 
    const SortDirection = this.sort?.direction || ''; 

    this.apiService
    .getInvoices(this.pageIndex, this.pageSize, SortColumn, SortDirection, this.name, this.invoiceno, this.startdate, this.enddate, this.IsValidatedRecord, this.IsSelfBill, this.CsmTeam,this.IsCompleteRecord, this.token)
      .subscribe({
        next: (response: any) => {
          this.allRecords = response.data.data;  
          this.dataSource.data = response.data.data;
          //console.log("✅ Incoming Data from API:", this.allRecords);
          this.totalRecords = response.data.totalRecords; 
          if (this.allRecords.length > 0) {
            this.isMovedInOriginaldb = this.allRecords[0].isMovedInOriginaldb;
        } else {
            this.isMovedInOriginaldb = false;  
        }
          this.loading = false; 
        },
        error: (err) => {
          console.error('API Error:', err);
          this.loading = false; 
        },
      });
}

  


  // onFilter(event: KeyboardEvent) {
  //   // Check if the key pressed is Enter (key code 13)
  //   if (event.key === 'Enter') {
  //     const input = event.target as HTMLInputElement;
  //     this.filterValue = input.value.trim(); // Get the filter value
  //     this.pageIndex = 1; // Reset to the first page for new filter
  //     this.loadInvoices(); // Reload data with the filter
  //   }
  // }


  onPageChanged(event: any) {

    if (this.pageSize !== event.pageSize) {

      this.pageSize = event.pageSize;
      this.pageIndex = 0; // Reset to the first page if page size changes
      this.IsAllRecord = false
      // this.selectedRecords = [];

    } else {

      this.pageIndex = event.pageIndex; // Adjust for 1-based indexing
      this.IsAllRecord = false
      this.selectedRecords = [];
    }

    this.loadInvoices();
  }

  // openInvoiceModal(invoiceData: any): void {



  //   const dialogRef = this.dialog.open(AfsinvoiceComponent,
  //     {
  //       width: '90%', 
  //       maxWidth: '600px', // Optional: Limit max width
  //       data: {
  //         ...invoiceData,  // Include all the properties of invoiceData


  //         thumbImage: '',  // Dynamically set image path
  //         fullImagePath: ''  // Dynamically set image path
  //       }
  //     });

  //   dialogRef.afterClosed().subscribe(result => {

  //     this.ClearSearch();
  //     console.log('The dialog was closed');
  //   });
  // }

  openInvoiceModal(invoiceData: any): void {

    const dialogRef = this.dialog.open(AfsinvoiceComponent, {
      width: '800px',
      data: invoiceData, // Pass row data to the modal
    });

    // Use afterClosed() on dialogRef to handle modal close event
    dialogRef.afterClosed().subscribe(result => {

      this.name = this.name;
      this.invoiceno = this.invoiceno;
      this.startdate = this.startdate;
      this.enddate = this.enddate;

      this.loadInvoices();

      console.log('The dialog was closed');
    });
  }

  SearchResults(form: any): void {

    this.pageIndex = 0;
    this.name = this.name;
    this.invoiceno = this.invoiceno;
    this.startdate = this.startdate;
    this.enddate = this.enddate;
    this.IsValidatedRecord = this.IsValidatedRecord;
    this.isChecked = this.isChecked;
    this.hideCheckBoxes = true;

    this.loadInvoices();
  }

 

  ClearSearch(): void {

    this.pageIndex = 0;
    this.name = '';
    this.invoiceno = '';
    this.startdate = ''; // Reset the start date
    this.enddate = ''; // Reset the end date
    this.IsValidatedRecord = false;
    this.CsmTeam = null;
    this.IsSelfBill = false;
    this.IsAllRecord = false
    this.selectedRecords = []
    this.hideCheckBoxes = true;
    this.IsCompleteRecord= false;
    const startDateInput = document.getElementById('startdate') as HTMLInputElement;
    const endDateInput = document.getElementById('enddate') as HTMLInputElement;

    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';
   

    this.loadInvoices();
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }

  getLimitedWords(text: string, wordLimit: number): string {
    if (!text) return '';
    const words = text.split(' '); 
    return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') + '...' : text;
  }
  

  onDownloadInvoice(row: any) {
    const invoiceID = row.afsInvoiceStatus;
    const isAdminorContractor = 0;
  this.loading=true;
    this.apiService.generateInvoicePDF(invoiceID, isAdminorContractor,this.token).subscribe(
      (response: any) => {
        if (response.succeeded) {
          const pdfPath = response.messages[0];  
          this.loading=false;
          if(pdfPath){
            console.log("pdfPath : "+ pdfPath)
            const fullPdfUrl = `https://wfmapi2.accessfinancial.com/${pdfPath.replace(/\\/g, '/')}`;
            window.open(fullPdfUrl, '_blank');
          }
          else{
            //alert('Failed to generate the invoice.');
            this.loading=false;
          }
        } else {
          alert('We are unable to display the invoice file. Please contact the system administrator.');
          this.loading=false;
        }
      },
      (error) => {
        console.error('Error generating invoice:', error);
        alert('An error occurred while generating the invoice.');
        this.loading=false;
      }
    );
  }

  // For checkbox logic when record is validated hide/unhide
  changeblur (event:any){
    this.IsAllRecord = false 
    this.selectedRecords= [] 
    if(!this.IsValidatedRecord && this.isMovedInOriginaldb){
      this.hideCheckBoxes = false;

    }
  }

  toggleAllRecords(event: any) {
    this.IsAllRecord = event.target.checked;
    //console.log(this.IsAllRecord, "IsAllRecord status updated");

    setTimeout(() => {
        if (!this.allRecords || this.allRecords.length === 0) {
            console.warn("⚠️ No records found in allRecords!");  
            this.selectedRecords = []; // Ensure it's an empty array instead of null
            return;  
        }

    if (this.IsAllRecord) {
        // ✅ Select all visible rows (excluding errors)
        this.selectedRecords = this.allRecords
            .filter(row => row.isErrorOnRow !== 1) // Exclude error rows
            .map(row => row.id);
    } else {
        // ❌ Unselect all
        this.selectedRecords = [];
    }

    // ✅ Ensure Angular detects changes
    this.selectedRecords = [...this.selectedRecords];

    //console.log("✅ Selected Records:", this.selectedRecords);
  }, 500); // Wait for 0.5 sec to ensure data is loaded
}


  
  
onCheckboxChange(event: any, id: number) {
  if (event.target.checked) {
      // ✅ Add to selected records
      this.selectedRecords.push(id);
  } else {
      // ❌ Remove from selected records
      this.selectedRecords = this.selectedRecords.filter(recordId => recordId !== id);
      
      // 🚨 If any row is unchecked, uncheck "Is All Batch Records?"
      this.IsAllRecord = false;
  }

  // ✅ Ensure Angular detects changes
  this.selectedRecords = [...this.selectedRecords];

  //console.log("Updated Selected Records:", this.selectedRecords);
}



  openBatchValidateConfirmationBox() {
    if (!this.selectedRecords || this.selectedRecords.length === 0) {
      this.notificationService.showNotification(
          'Please select at least one record to batch validate.',
          'WARNING',
          'warning',
          () => {console.log('User acknowledged warning') }
      );
      return;
  }
  else{

    this.popupComponent.openPopup(
      'Confirmation',
      'Are you sure that you want to proceed?',
      'warning',
      () => {
        console.log('Yes action clicked!');
        this.BatchValidate();
      },
      () => {
        console.log('No action clicked!');
      }
    );
  }
}
  
//   BatchValidate() {
//     // Determine the records to send
//     let recordsToSend: number[];
//     console.log(this.selectedRecords,"akashs")
//     if (this.IsAllRecord) {
//         // If "Is All Record" is checked, send all valid records
//         recordsToSend = this.allRecords
//             .filter(row => row.isErrorOnRow !== 1) // Exclude rows with errors
//             .map(row => row.id);
//     } else {
//         // Otherwise, send only manually selected records
//         recordsToSend = this.selectedRecords;
//     }

//     if (recordsToSend.length === 0) {
//         alert("Please select at least one record to validate.");
//         return;
//     }

//     console.log(recordsToSend, "Records to be validated");

//     const apiUrl = environment.API_BASE_URL + 'OCRAI/SelfBillBatchValidate';
//     this.notificationService.setNotificationVisibility(true);
    
//     const headers = new HttpHeaders({
//         Authorization: `Bearer ${this.token}`,
//         'Content-Type': 'application/json',
//     });

//     const body = {
//       selectedIds: recordsToSend, // ✅ Match backend's "SelectedIds"
//       IsAllRecord: this.IsAllRecord // ✅ Match backend's "IsAllRecord"
//   };
  
    
//     // Send the records to be validated

//     this.http.post<any>(apiUrl, body, { headers }).subscribe({
//         next: (response) => {
//             if (response && response.data && response.data.length > 0 && response.data[0].status === 4) {
//                 this.notificationService.showNotification(
//                     'Records have been validated and processed successfully.',
//                     'INFORMATION',
//                     'success',
//                     () => {
//                         console.log('OK clicked 4');
//                         this.notificationService.setNotificationVisibility(false);
//                         window.location.reload();
//                     }
//                 );
//             }
//         },
//         error: (error) => {
//             console.error("Error Response:", error);
//             this.notificationService.showNotification(
//                 'Unable to complete the action. Please retry.',
//                 'ERROR',
//                 'error',
//                 () => {
//                     console.log('Error callback');
//                     this.notificationService.setNotificationVisibility(false);
//                 }
//             );
//         },
//     });
// }

BatchValidate() {
  // ✅ Show warning popup if no records are selected
 this.loading = true;

  const apiUrl = environment.API_BASE_URL + 'OCRAI/SelfBillBatchValidate';
  this.notificationService.setNotificationVisibility(true);

  const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
  });

  console.log("Headers:", headers);

  const body = {
      selectedIds: this.selectedRecords, // ✅ Send selected record IDs
      IsAllRecord: this.IsAllRecord      // ✅ Send boolean flag
  };

  console.log("Payload Sent to API:", body);

  this.http.post<any>(apiUrl, body, { headers }).subscribe({
      next: (response) => {
        console.log('con ID', response.data[0].statusMsg);

        if (response?.data?.length > 0) {
          this.loading = false;
      
          // Check if status is 4 and no status message exists
          if (response.data[0].status === 4 && response.data[0].statusMsg =="") {
              this.notificationService.showNotification(
                  'Records have been validated and processed successfully. The updates have been applied to those that meet the criteria.',
                  'INFORMATION',
                  'success',
                  () => {
                      console.log('OK clicked 4');
                      this.notificationService.setNotificationVisibility(false);
                      window.location.reload();
                  }
              );
          }
      
          // Check if there are issues with validation (non-empty statusMsg)
          if (response.data[0].statusMsg && response.data[0].statusMsg.length > 0) {
              this.notificationService.showNotification(
                  `Validation was successful for some records, but failed for records associated with ${response.data[0].statusMsg}. Please review and correct these records individually, then revalidate.`,
                  'INFORMATION',
                  'warning',
                  () => {
                      console.log('OK clicked with issues');
                      this.notificationService.setNotificationVisibility(false);
                      window.location.reload();
                  }
              );
          }
      }
      },
      error: (error) => {
          console.error("Error Response:", error);
          this.loading= false;
          this.notificationService.showNotification(
              'Unable to complete the action. Please retry.',
              'ERROR',
              'error',
              () => {
                  console.log('Error callback');
                  this.notificationService.setNotificationVisibility(false);
              }
          );
      },
  });
}

getCsmTeam() {
  const apiUrl = environment.API_BASE_URL + 'OCRAI/GetCsmTeamData';
  this.notificationService.setNotificationVisibility(true);

  const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
  });

  this.http.post<any>(apiUrl, {}, { headers }).subscribe({
      next: (data) => {
        this.csmTeamarr = data.data.csmTeamList;     
          // if (data && data.data && data.data.CsmTeamList && Array.isArray(data.data.CsmTeamList)) {
          //   this.csmTeamarr = data.data.csmTeamList;     
          //   console.log('this.csmTeamarr', this.csmTeamarr)         
          // }
      },
      error: (error) => {
          console.error("Error Response:", error);        
      },
  });
}
openSelfBillPopup(): void {
  const dialogRef = this.dialog.open(AfsselfbillnotificationComponent, {
    width: '800px',
    height:'330px',
    data: { token: this.token }  // Passing token here
  });

  dialogRef.afterClosed().subscribe(result => {
    console.log('The dialog was closed, result:', result); // Receiving data back if needed
  });
}
}



