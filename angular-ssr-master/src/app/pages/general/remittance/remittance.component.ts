import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceService } from './remittance.service';
import { Invoice } from './remittance';
import { RemittancePopupComponent } from '../remittance-popup/remittance-popup.component';
import { ConfirmationPopComponent } from '../confirmation-pop/confirmation-pop.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { RemittanceAllocationComponent } from '../remittance-allocation/remittance-allocation.component';


@Component({
  selector: 'app-remittance',
  templateUrl: './remittance.component.html',
  styleUrls: ['./remittance.component.css']
})


export class RemittanceComponent implements OnInit, AfterViewInit {

  
  @ViewChild(ConfirmationPopComponent) popupComponent!: ConfirmationPopComponent;

  
  displayedColumns: string[] = ['contractorName','invoiceDate', 'DueDate','invoiceNumber','paidAmount','invoiceAmount','selfBillInvoiceNo','description','actions'];
  dataSource = new MatTableDataSource<Invoice>();
  totalRecords: number = 0;
  pageIndex: number = 0;
  pageSize: number = 10;
  IsValidatedRecord = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  tokenData: string = '';
  token: string = '';
  loading: boolean = false;
  invoiceno: string = ''
  name:string=''
  selfBillInvoiceNo:string=''
  invoiceDate:string=''




  constructor(private invoiceService: InvoiceService, private dialog: MatDialog,private breakpointObserver: BreakpointObserver) {}


  ngOnInit() {

    this.breakpointObserver.observe(['(max-width: 700px)']).subscribe((result) => {
      if (result.matches) {
        // Mobile view: Show "actions" first
        this.displayedColumns = ['actions','contractorName','invoiceDate', 'DueDate','invoiceNumber','paidAmount','invoiceAmount','selfBillInvoiceNo','description'];
      } else {
        // Desktop view: Default order
        this.displayedColumns = ['contractorName','invoiceDate', 'DueDate','invoiceNumber','paidAmount','invoiceAmount','selfBillInvoiceNo','description','actions'];
      }
    });

    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.token = storedToken; 
    } else {
      console.error('Token not found in localStorage.');
     
    }

    this.remittanceRecord(); 
  }

  ngAfterViewInit() {

    this.sort.sortChange.subscribe(() => {

      this.pageIndex = 0; 
      this.remittanceRecord(); 
    });
  }




  remittanceRecord() {

    this.loading = true; 
    const SortColumn = this.sort?.active || ''; 
    const SortDirection = this.sort?.direction || ''; 

    this.invoiceService
      .getRemittanceRecord(this.pageIndex, this.pageSize, SortColumn, SortDirection, this.name, this.invoiceno,this.invoiceDate, this.selfBillInvoiceNo, this.IsValidatedRecord,this.token)
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

  SearchResults(form: any): void {

    this.pageIndex = 0;
    this.name = this.name;
    this.invoiceno = this.invoiceno;
    this.selfBillInvoiceNo = this.selfBillInvoiceNo;
    this.invoiceDate = this.invoiceDate;
    this.IsValidatedRecord = this.IsValidatedRecord;
  
    this.remittanceRecord();
  }

  onPageChanged(event: any) {

    if (this.pageSize !== event.pageSize) {

      this.pageSize = event.pageSize;
      this.pageIndex = 0; // Reset to the first page if page size changes

    } else {

      this.pageIndex = event.pageIndex; // Adjust for 1-based indexing
    }

    this.remittanceRecord();
  }
  
//  openInvoiceModal(invoiceData: any): void {
  
 
//     const dialogRef = this.dialog.open(RemittancePopupComponent, {
//       width: '800px',
//       data: invoiceData, // Pass row data to the modal
//     });

//     // Use afterClosed() on dialogRef to handle modal close event
//     dialogRef.afterClosed().subscribe(result => {

//        this.remittanceRecord();
//       console.log('The dialog was closed');
//     });
//   }

openValidateModal(invoiceData: any): void {
  const dialogRef = this.dialog.open(RemittancePopupComponent, {
    width: '800px',
    data: invoiceData, 
  });

  dialogRef.afterClosed().subscribe(result => {
    this.remittanceRecord();
    console.log('The validation dialog was closed');
  });
}

openAllocationModal(invoiceData: any): void {
  this.dialog.open(RemittanceAllocationComponent, {});
}


  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }


  openConfirmationBox() {
    this.popupComponent.openPopup(
      'Confirmation',
      'Are you sure that you want to proceed?',
      'warning',
      () => {
        console.log('Save clicked!');
      },
      () => {
        console.log('Cancel clicked!');
      }
    );
  }

  ClearSearch(): void {

    this.pageIndex = 0;
    console.log("clearsearch clicked")
    this.name = '';
    this.invoiceno = '';
    this.invoiceDate = ''; // Reset the start date
    this.selfBillInvoiceNo = ''; // Reset the end date
    this.IsValidatedRecord = false;

    const startDateInput = document.getElementById('invoiceDate') as HTMLInputElement;
    // const endDateInput = document.getElementById('enddate') as HTMLInputElement;

    if (startDateInput) startDateInput.value = '';
    // if (endDateInput) endDateInput.value = '';

    this.remittanceRecord();
  }

  formatAmount(amount: any): string {
    return amount ? parseFloat(amount).toFixed(2) : '0.00';
  }

    openAllocationpopup(): void {
  
      const dialogRef = this.dialog.open(RemittanceAllocationComponent, {
        // width: '800px',
        // data: invoiceData, 
      });
  
      // Use afterClosed() on dialogRef to handle modal close event
      dialogRef.afterClosed().subscribe(result => {
  
        // this.name = this.name;
        // this.invoiceno = this.invoiceno;
        // this.startdate = this.startdate;
        // this.enddate = this.enddate;
  
        // this.loadInvoices();
  
        console.log('The dialog was closed');
      });
    }
  
}
