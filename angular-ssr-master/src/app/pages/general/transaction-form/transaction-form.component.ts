import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { RemittanceAllocationComponent } from '../remittance-allocation/remittance-allocation.component';
import { MatDialog } from '@angular/material/dialog';
import { TransactionFormService } from '../transaction-form/transaction-form.service';
import { MatTableDataSource } from '@angular/material/table';
import { TransactionForm } from './transaction-form';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css']
})
export class TransactionFormComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'mvtID',
    'mvtKey',
    'mvtDate',
    'mvtValueDate',
    'mvtDateReconciled',
    'refRem',
    'invoiceNumber',
    // 'mvtAmountSent',
    'mvtAmountRcvd',
    // 'mvtCurrency',
    // 'mvtReconciled',
    // 'mvtBkClearing',
    'mvtBkAccount',
    // 'mvtType',
    // 'mvtUserReconciled',
    // 'mvtDtLastUpdate',
    // 'mvtDtUser',
    // 'PIStatus',
    // 'mvtlRef',
    // 'mvtDtCreated',
    'bkiAccountName',
    // 'cieDesc',
    // 'notes',
    'actions'
  ];

  pageIndex: number = 0;
  pageSize: number = 10;
  name: string = '';
  invoiceNumber: string = '';
  mvtDate: string = '';
  mvtValueDate: string = '';
  mvtType: string = '';
  mvtKey: string = '';
  loading: boolean = false;
  mvtDtCreated: string = '';
  IsRecordAllocated = false;
  totalRecords: number = 0;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<TransactionForm>([]);
  constructor(private dialog: MatDialog, private transactionFormService: TransactionFormService) { }

  ngOnInit() {
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


    this.transactionFormService
      .getTransaction(
        this.pageIndex,
        this.pageSize,
        SortColumn,
        SortDirection,
        this.invoiceNumber,
        this.mvtDate,
        this.mvtValueDate,
        this.mvtType,
        this.IsRecordAllocated

      )
      .subscribe({
        next: (response: any) => {
          console.log('API Response:', response);


          // Ensure data is assigned properly
          this.dataSource = new MatTableDataSource(response.data.data);
          this.totalRecords = response.data.totalRecords;
          this.loading = false;
        },
        error: (err) => {
          console.error('API Error:', err);
          this.loading = false;
        }
      });
  }


  onPageChanged(event: any) {

    if (this.pageSize !== event.pageSize) {

      this.pageSize = event.pageSize;
      this.pageIndex = 0;

    } else {

      this.pageIndex = event.pageIndex;
    }

    this.loadInvoices();
  }

  openAllocationModal(invoiceData: any): void {
    this.dialog.open(RemittanceAllocationComponent, { data: invoiceData });
  }

  applyFilter(form: any): void {
    this.loadInvoices();
  }


    ClearSearch() {
      this.pageIndex = 0;
      console.log("clearsearch clicked")
      this.mvtType=''
      this.mvtDate = '';
      this.invoiceNumber = ''; 
      this.mvtValueDate = '';
      this.IsRecordAllocated = false;
      this.loadInvoices();
  }
}