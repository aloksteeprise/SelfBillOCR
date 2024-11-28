import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ApiService } from '../afsinvoices/afsinvoices.service';
import { afsInvoice } from '../afsinvoices/afsinvoices.model';
import { MatDialog } from '@angular/material/dialog';
import { AfsInvoicesPopupComponent } from '../afs-invoices-popup/afs-invoices-popup.component';

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
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  token: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IkJvdHRlc3QiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJwYWhhcmkubWNhQGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJUZXN0IFRpbWVzaGVldCIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL3N1cm5hbWUiOiIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9tb2JpbGVwaG9uZSI6IiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkNvbnRyYWN0b3IiLCJleHAiOjE3MzI4NjMzNzN9.fukTWksDM9BH0q6P3M4yd0Mi2RKmkH4ae6ziGeOhk1E'; 

  constructor(private apiService: ApiService,private dialog: MatDialog) {}

  ngOnInit() {
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
    const SortColumn = this.sort?.active || ''; // Safely access sort.active
    const SortDirection = this.sort?.direction || ''; // Safely access sort.direction

    this.apiService
      .getInvoices(this.pageIndex, this.pageSize, SortColumn, SortDirection, this.token)
      .subscribe({
        next: (response:any) => {
          debugger;
          this.dataSource.data = response.data.data;
          //this.totalRecords = response.data[0]?.totalRecords || 0; // Handle undefined values
          this.totalRecords = response.data.totalRecords; // Handle undefined values
          // Update paginator length
        // if (this.paginator) {
        //   this.paginator.length = this.totalRecords;
        // }
        },
        error: (err) => {
          console.error('API Error:', err);
          // alert('Failed to load invoices. Check the console for details.');
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

  openInvoiceModal(invoiceData: any): void {
    debugger;
     // Replace '.pdf' extension with '.png'
    const imageFileName = invoiceData.invoiceFileName.replace(/\.pdf$/i, '.png');

    

    const dialogRef = this.dialog.open(AfsInvoicesPopupComponent, 
      {
        width: '60vw',
        maxWidth: '100vw',
        height:'80%',
      data: {
        ...invoiceData,  // Include all the properties of invoiceData
        //thumbImage: 'assets/documents/image.png',  // Pass the image path as part of data
        //fullImagePath: 'assets/documents/image.png'  // Pass the image path as part of data
        //thumbImage: `assets/documents/${invoiceData.invoiceFileName}`,  // Dynamically set image path
        //fullImagePath: `assets/documents/${invoiceData.invoiceFileName}`  // Dynamically set image path

        thumbImage: `assets/documents/${imageFileName}`,  // Dynamically set image path
        fullImagePath: `assets/documents/${imageFileName}`  // Dynamically set image path
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  

}
