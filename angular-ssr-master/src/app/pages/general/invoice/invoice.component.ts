import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceService } from './invoice.service';
import { Invoice } from './invoice';
import { AfsinvoiceComponent } from '../afsinvoice/afsinvoice.component';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})


export class InvoiceComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  

  displayedColumns: string[] = ['contractorName','invoiceDate', 'DueDate','invoiceNumber','paidAmount','invoiceAmount','selfBillInvoiceNo','description','actions'];
  dataSource = new MatTableDataSource<Invoice>();

  constructor(private invoiceService: InvoiceService, private dialog: MatDialog) {}

  ngOnInit() {
    //debugger;
    this.invoiceService.getAllContractorInvoices().subscribe((result: any) => {
      this.dataSource.data = result.data; 
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // openInvoiceModal(invoiceData: any): void {
  //   const dialogRef = this.dialog.open(AfsinvoiceComponent, {
  //     width: '800px', // Modal width
  //     data: invoiceData, // Data passed to the modal
  //   });

  //   // Callback after modal is closed
  //   dialogRef.afterClosed().subscribe(result => {
  //     console.log('The dialog was closed', result);
  //   });
  // }

  openInvoiceModal(row: any): void {
    this.dialog.open(AfsinvoiceComponent, {
      width: '800px',
      data: row, // Pass row data to the modal
    });
  }
}
