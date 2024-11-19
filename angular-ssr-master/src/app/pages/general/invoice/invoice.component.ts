
// import { Component, OnInit } from '@angular/core';
import { Component, AfterViewInit, ViewChild ,OnInit} from '@angular/core';

//import { ArticleService } from './article.service';
import { MatTableDataSource, } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { InvoiceService } from './invoice.service';
import { Invoice } from './invoice';
// import { Invoice } from './invoice';
import { InvoiceRequest } from './invoiceRequest';

// import { Song } from '../../application/example-services/song/song';

// import { SongService } from '../../application/example-services/song/song.service';

@Component({
  selector: 'app-invoice',
  //standalone: true,
  //imports: [],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']  
})
export class InvoiceComponent implements OnInit,AfterViewInit {

  // @ViewChild(MatSort) sort = {} as MatSort;
  //   @ViewChild(MatPaginator) paginator = {} as MatPaginator;
  
    @ViewChild(MatSort) sort!: MatSort;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    constructor(private invoiceService: InvoiceService) { }

    displayedColumns: string[] = ['docCode', 'docDescription', 'ctdDesc'];
    dataSource = new MatTableDataSource<Invoice>();
    
    ngOnInit() {
      this.invoiceService.getAllContractorInvoices().subscribe((Result: any) => {
        console.log(Result);
        this.dataSource.data = Result.data;  // Accessing data array within Result
      });
    }

    ngAfterViewInit() {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }

    applyFilter(filterValue: string) {
      this.dataSource.filter = filterValue.trim().toLowerCase();
}
}
