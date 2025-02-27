import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { RemittanceAllocationComponent } from '../remittance-allocation/remittance-allocation.component';
import { MatDialog } from '@angular/material/dialog';
import { TransactionFormService } from '../transaction-form/transaction-form.service';
import { MatTableDataSource } from '@angular/material/table';
import { TransactionForm } from './transaction-form';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ConfirmationPopComponent } from '../confirmation-pop/confirmation-pop.component';
import { SharedUtils  } from '../shared/shared-utils';

@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css']
})
export class TransactionFormComponent implements OnInit, AfterViewInit {
  @ViewChild(ConfirmationPopComponent) popupComponent!: ConfirmationPopComponent;
  displayedColumns: string[] = [
    'mvtID',
    'mvtKey',
    'mvtDate',
    'mvtValueDate',
    'mvtDateReconciled',
    'refRem',
    'invoiceNumber',
    'Selfbill',
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
  mvtTypeList: string[] = ['PrevDay', 'IntraDay']; // Replace with actual values
  mvtType: string = ''; // Stores the selected value

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
    console.log('Selected Mvt Type:', this.mvtType);
    this.loadInvoices();
  }


  ClearSearch() {
    this.pageIndex = 0;
    console.log("clearsearch clicked")
    this.mvtType = ''
    this.mvtDate = '';
    this.invoiceNumber = '';
    this.mvtValueDate = '';
    this.IsRecordAllocated = false;

    // const valuedate = document.getElementById('mvtValueDate') as HTMLInputElement;
    // const mvtdates = document.getElementById('mvtDate') as HTMLInputElement;
 

    // if (valuedate) valuedate.value = '';
    // if (mvtdates) mvtdates.value = '';

    this.loadInvoices();
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

  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }

  formatAmount(amount: any): string {
    return amount ? parseFloat(amount).toFixed(2) : '0.00';
  }
}