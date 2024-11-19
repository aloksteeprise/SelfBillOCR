import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from '../afsinvoices/afsinvoices.service';
import { afsInvoice } from '../afsinvoices/afsinvoices.model';

@Component({
  selector: 'app-afsinvoices',
  templateUrl: './afsinvoices.component.html',
  styleUrls: ['./afsinvoices.component.css'],
})
export class AfsInvoicesComponent implements OnInit {
  displayedColumns: string[] = ['docCode', 'docDescription', 'ctdDesc'];
  dataSource = new MatTableDataSource<afsInvoice>([]);
  totalRecords: number = 0;
  pageIndex: number = 1;
  pageSize: number = 3;

  // Replace with token retrieval logic (e.g., from a login service)
  token: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IkJvdHRlc3QiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJwYWhhcmkubWNhQGdtYWlsLmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJUZXN0IFRpbWVzaGVldCIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL3N1cm5hbWUiOiIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9tb2JpbGVwaG9uZSI6IiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkNvbnRyYWN0b3IiLCJleHAiOjE3MzIxNzA0NTV9.i3Uo-DZxGrPRBhN0LgOfLhkfZ8jzVw65TwBI947FfVs'; 
  contractCode = 32651;
  invFromDate = new Date('2022-11-14T06:24:19.825Z');
  invToDate = new Date('2024-11-14T06:24:19.825Z');
  contractorCode = '0Z202201280854ByZoho';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.apiService
      .getInvoices(
        this.contractCode,
        this.invFromDate,
        this.invToDate,
        this.contractorCode,
        this.pageIndex,
        this.pageSize,
        this.token
      )
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.data;
          this.totalRecords = response.data[0].totalRecord;
          //this.totalRecords = response.data[0].totalRecord;
          console.log(response.total);
        },
        error: (err) => {
          console.error('API Error:', err);
          alert('Failed to load invoices. Check the console for details.');
        },
      });
  }

  // onPageChanged(event: any) {
  //   debugger;
  //   this.pageIndex = event.pageIndex;
  //   this.pageSize = event.pageSize;
  //   this.loadInvoices();
  // }
  onPageChanged(event: any) {
    if (this.pageSize !== event.pageSize) {
      // Reset to the first page if the page size changes
      this.pageSize = event.pageSize;
      this.pageIndex = 1; // Use 1 as the first page for API compatibility
    } else {
      this.pageIndex = event.pageIndex + 1; // Adjust for API's 1-based indexing
    }
  
    this.loadInvoices(); // Reload data with updated pageIndex and pageSize
  }
  
}
