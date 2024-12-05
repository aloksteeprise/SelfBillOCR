import { Component, OnInit, ViewChild, AfterViewInit, input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ApiService } from '../afsinvoices/afsinvoices.service';
import { afsInvoice } from '../afsinvoices/afsinvoices.model';
import { MatDialog } from '@angular/material/dialog';
import { AfsInvoicesPopupComponent } from '../afs-invoices-popup/afs-invoices-popup.component';
import { AfsinvoiceComponent } from '../afsinvoice/afsinvoice.component';

@Component({
  selector: 'app-afsinvoices',
  templateUrl: './afsinvoices.component.html',
  styleUrls: ['./afsinvoices.component.css'],
})

export class AfsInvoicesComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = [
    'contractorName',
    'cFirstName',
    'cLastName',
    'startDate',
    'endDate',
    'totalAmount',
    'selfBillInvoiceNo',
    // 'selfBillInvoiceContractNo',
    // 'errorID',
    'errorMessage',
    'actions'
  ];

  dataSource = new MatTableDataSource<afsInvoice>([]);
  totalRecords: number = 0;
  pageIndex: number = 0;
  pageSize: number = 10;
  filterValue: string = '';
  name: string = '';
  invoiceno: string = '';
  startdate: string = '';
  enddate: string = '';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  tokenData: string = '';
  token: string = '';
  loading: boolean = false;
  //token: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6InNoeWFtIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvZW1haWxhZGRyZXNzIjoic2h5YW1zdW5kYXIucGFoYXJpQGFjY2Vzc2ZpbmFuY2lhbC5jb20iLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiU2h5YW1zdW5kYXIgUGFoYXJpIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvc3VybmFtZSI6IiIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL21vYmlsZXBob25lIjoiKzkxLTk5MTAwNzY1NzMiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbmlzdHJhdG9yIiwiZXhwIjoxNzMzNDY4NTY3fQ.FX1TSsGpyHGCdMmz6pzQgVMVcp-1Rz3f9sXNhzuDYyY';

  constructor(private apiService: ApiService, private dialog: MatDialog) { }

  ngOnInit() {

    debugger;
    // Retrieve the token from localStorage dynamically
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.token = storedToken; // Assign the token from localStorage
    } else {
      console.error('Token not found in localStorage.');
      // Handle token absence (e.g., redirect to login)
    }

    this.loadInvoices(); // Initial data load
  }

  ngAfterViewInit() {

    // this.dataSource.paginator = this.paginator; // Assign paginator after view init
    // this.dataSource.sort = this.sort; // Assign sort after view init

    this.sort.sortChange.subscribe(() => {

      this.pageIndex = 0; // Reset to the first page on sort change
      this.loadInvoices(); // Reload invoices with updated sorting
    });
  }

  loadInvoices() {
    this.loading = true; // Start loading
    const SortColumn = this.sort?.active || ''; // Safely access sort.active
    const SortDirection = this.sort?.direction || ''; // Safely access sort.direction

    this.apiService
      .getInvoices(this.pageIndex, this.pageSize, SortColumn, SortDirection, this.name, this.invoiceno, this.startdate, this.enddate, this.token)
      .subscribe({
        next: (response: any) => {
          debugger;
          this.dataSource.data = response.data.data;
          this.totalRecords = response.data.totalRecords; // Handle undefined values
          this.loading = false; // Stop loading
        },
        error: (err) => {
          console.error('API Error:', err);
          this.loading = false; // Stop loading even on error
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

  //   debugger;
  //   // Replace '.pdf' extension with '.png'
  //   //const imageFileName = invoiceData.invoiceFileName.replace(/\.pdf$/i, '.png');

  //   const dialogRef = this.dialog.open(AfsInvoicesPopupComponent,
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

    this.loadInvoices();
  }

  ClearSearch(): void {

    this.pageIndex = 0;
    this.name = '';
    this.invoiceno = '';
    this.startdate = '';
    this.enddate = '';

    this.loadInvoices();
  }
}
