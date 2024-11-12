
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
  styleUrl: './invoice.component.css'
})
export class InvoiceComponent implements OnInit,AfterViewInit {

  @ViewChild(MatSort) sort = {} as MatSort;
    @ViewChild(MatPaginator) paginator = {} as MatPaginator;

    constructor(private invoiceService: InvoiceService) { }

    displayedColumns: string[] = ['docCode', 'docDescription', 'ctdDesc'];
    dataSource = new MatTableDataSource<Invoice>();
    
    ngOnInit() {

      debugger;
      this.invoiceService.getAllContractorInvoices().subscribe((Result: Invoice[]) => {
        console.log(Result);
        this.dataSource.data=Result;
        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;

        console.log(this.dataSource);
      });
      
    }

    ngAfterViewInit() {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
}
