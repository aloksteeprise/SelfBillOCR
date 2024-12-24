import { Component, OnInit, ViewChild, AfterViewInit, input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ApiService } from '../afsinvoices/afsinvoices.service';
import { afsInvoice } from '../afsinvoices/afsinvoices.model';
import { MatDialog } from '@angular/material/dialog';
import { AfsInvoicesPopupComponent } from '../afs-invoices-popup/afs-invoices-popup.component';
import { AfsinvoiceComponent } from '../afsinvoice/afsinvoice.component';
import { ConfirmationPopComponent } from '../confirmation-pop/confirmation-pop.component';
import {environment} from '../constant/api-constants';
import { NotificationPopupService } from '../notification-popup/notification-popup.service';
import { HttpClient } from '@angular/common/http';


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
    'actions'
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
  

  constructor(private apiService: ApiService, private dialog: MatDialog,  public notificationService: NotificationPopupService,private http: HttpClient ) { }

  ngOnInit() {

    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.token = storedToken; 
    } else {
      console.error('Token not found in localStorage.');
     
    }

    this.loadInvoices(); 
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
      .getInvoices(this.pageIndex, this.pageSize, SortColumn, SortDirection, this.name, this.invoiceno, this.startdate, this.enddate, this.IsValidatedRecord, this.token)
      .subscribe({
        next: (response: any) => {

          this.dataSource.data = response.data.data;
          this.totalRecords = response.data.totalRecords; 
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

    } else {

      this.pageIndex = event.pageIndex; // Adjust for 1-based indexing
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

    this.loadInvoices();
  }

  ClearSearch(): void {

    this.pageIndex = 0;
    this.name = '';
    this.invoiceno = '';
    this.startdate = ''; // Reset the start date
    this.enddate = ''; // Reset the end date
    this.IsValidatedRecord = false;

    const startDateInput = document.getElementById('startdate') as HTMLInputElement;
    const endDateInput = document.getElementById('enddate') as HTMLInputElement;

    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';

    this.loadInvoices();
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }

  onDownloadInvoice(row: any) {

    const invoiceID = row.afsInvoiceStatus;
    const isAdminorContractor = 0;

    this.apiService.generateInvoicePDF(invoiceID, isAdminorContractor).subscribe(
      (response: any) => {
        if (response.succeeded) {
          const pdfPath = response.messages[0];
          console.log("pdfPath : "+ pdfPath)
          const fullPdfUrl = `https://wfmapi.accessfinancial.com/${pdfPath.replace(/\\/g, '/')}`;
          window.open(fullPdfUrl, '_blank');
        } else {
          alert('Failed to generate the invoice.');
        }
      },
      (error) => {
        console.error('Error generating invoice:', error);
        alert('An error occurred while generating the invoice.');
      }
    );
  }

  openBatchValidateConfirmationBox() {
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
  
  BatchValidate() {
    const apiUrl = environment.API_BASE_URL + 'OCRAI/SelfBillBatchValidate';
    this.notificationService.setNotificationVisibility(true);
  
    this.http.post<any>(apiUrl, {}).subscribe({
      next: (response) => {
        if (response && response.data && response.data.length > 0 && response.data[0].status === 4) {
          this.notificationService.showNotification(
            'Records have been validated and processed successfully.',
            'INFORMATION',
            'success',
            () => {
              console.log('OK clicked 4');
              this.notificationService.setNotificationVisibility(false); // Hide after OK
            }
          );
        }
      },
      error: (error) => {
        this.notificationService.showNotification(
          'Unable to complete the action. Please retry.',
          'ERROR',
          'error',
          () => {
            console.log('Error callback');
            this.notificationService.setNotificationVisibility(false); // Hide after OK
          }
        );
      },
    });
  }
  


}
