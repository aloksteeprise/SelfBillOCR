import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceService } from './remittance.service';
import { Invoice } from './remittance';
import { RemittancePopupComponent } from '../remittance-popup/remittance-popup.component';
import { ConfirmationPopComponent } from '../confirmation-pop/confirmation-pop.component';

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

  constructor(private invoiceService: InvoiceService, private dialog: MatDialog) {}

  // ngOnInit() {
  //   debugger;
  //   this.invoiceService.getAllContractorInvoices().subscribe((result: any) => {
  //     debugger;
  //     this.dataSource.data = result.data; 
  //   });
  // }

  // ngAfterViewInit() {
  //   this.dataSource.paginator = this.paginator;
  //   this.dataSource.sort = this.sort;
  // }

  // applyFilter(filterValue: string) {
  //   this.dataSource.filter = filterValue.trim().toLowerCase();
  // }

  ngOnInit() {

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
      .getRemittanceRecord(this.pageIndex, this.pageSize, SortColumn, SortDirection, this.token)
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

  onPageChanged(event: any) {

    if (this.pageSize !== event.pageSize) {

      this.pageSize = event.pageSize;
      this.pageIndex = 0; // Reset to the first page if page size changes

    } else {

      this.pageIndex = event.pageIndex; // Adjust for 1-based indexing
    }

    this.remittanceRecord();
  }
  // openInvoiceModal(invoiceData: any): void {
  //   const dialogRef = this.dialog.open(AfsRemittanceComponent, {
  //     width: '800px', // Modal width
  //     data: invoiceData, // Data passed to the modal
  //   });

  //   // Callback after modal is closed
  //   dialogRef.afterClosed().subscribe(result => {
  //     console.log('The dialog was closed', result);
  //   });
  // }


 openInvoiceModal(invoiceData: any): void {

    const dialogRef = this.dialog.open(RemittancePopupComponent, {
      width: '800px',
      data: invoiceData, // Pass row data to the modal
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
}
