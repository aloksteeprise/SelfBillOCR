import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { RemittanceAllocationComponent } from '../remittance-allocation/remittance-allocation.component';
import { MatDialog } from '@angular/material/dialog';
import { TransactionFormService } from '../transaction-form/transaction-form.service';
import { MatTableDataSource } from '@angular/material/table';
import { TransactionForm } from './transaction-form';
import {Company} from './transaction-form';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ConfirmationPopComponent } from '../confirmation-pop/confirmation-pop.component';
import { SharedUtils  } from '../shared/shared-utils';
import { FormsModule } from '@angular/forms';
import {ManualAllocationPopupComponent} from '../manual-allocation-popup/manual-allocation-popup.component'

@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css']
})
export class TransactionFormComponent implements OnInit, AfterViewInit {
  @ViewChild(ConfirmationPopComponent) popupComponent!: ConfirmationPopComponent;
  displayedColumns: string[] = [
    //'mvtID',
    //'mvtKey',
    'mvtDate',
    'mvtValueDate',
    //'mvtDateReconciled',
    'refRem',
    //'Selfbill',
    'mvtAmountSent',
    'mvtAmountRcvd',
    'mvtCurrency',
    // 'mvtReconciled',
    // 'mvtBkClearing',
    'mvtBkAccount',
    'mvtType',
    // 'mvtUserReconciled',
    // 'mvtDtLastUpdate',
    // 'mvtDtUser',
    // 'PIStatus',
    // 'mvtlRef',
    // 'mvtDtCreated',
    'bkiAccountName',
    // 'cieDesc',
    // 'notes',
    'allocation',
    'validate',
    'actions'

  ];

  
  companyList : any[] = [];
  bankAccountList : any[] = [];
  selectedCompany: Company | null = null;
  selectedBankAccount : any | null = null;
  pageIndex: number = 0;
  pageSize: number = 10;
  mvtFromDate: string = '';
  mvtToDate: string = '';
  mvtValueFromDate: string = '';
  mvtValueToDate: string = '';
  internalCompany: string = '';
  bankAccount: string = '';
  mvtTypeList: string[] = ['PrevDay', 'IntraDay']; // Replace with actual values
  mvtType: string = '';
  loading: boolean = false;
  IsRecordAllocated = false;
  money = true;
  totalRecords: number = 0;
  token: string = '';
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<TransactionForm>([]);
  constructor(private dialog: MatDialog, private transactionFormService: TransactionFormService) { }

  ngOnInit() {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.token = storedToken; 
    } else {
      console.error('Token not found in localStorage.');    
    }
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    this.mvtFromDate = today;
    this.mvtToDate = today;
    this.mvtValueFromDate = today;
    this.mvtValueToDate = today;
    this.getCompanies();
    this.loadInvoices();
    this.selectedBankAccount = '';
    this.selectedCompany = null;
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
        this.mvtFromDate,
        this.mvtToDate,
        this.mvtValueFromDate,
        this.mvtValueToDate,
        this.mvtType,
        this.selectedCompany?.cieDesc,
        this.selectedBankAccount,
        this.money,
        this.IsRecordAllocated,
        this.token
      )
      .subscribe({
        next: (response: any) => {
          console.log('API Response:', response);

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
    this.mvtType = ''
    this.mvtFromDate = '';
    this.mvtToDate = '';
    this.mvtValueFromDate = '';
    this.mvtValueToDate = ''
    this.selectedBankAccount = '';
    this.selectedCompany = null;
    this.money = true;
    this.IsRecordAllocated = false;

    const mvtFromDate = document.getElementById('mvtFromDate') as HTMLInputElement;
    const mvtToDate = document.getElementById('mvtToDate') as HTMLInputElement;
    const mvtValueFromDate = document.getElementById('mvtValueFromDate') as HTMLInputElement;
    const mvtValueToDate = document.getElementById('mvtValueToDate') as HTMLInputElement;

    if (mvtFromDate) mvtFromDate.value = '';
    if (mvtToDate) mvtToDate.value = '';
    if (mvtValueFromDate) mvtValueFromDate.value = '';
    if (mvtValueToDate) mvtValueToDate.value = '';

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

  getCompanies() {
    this.transactionFormService.getCompanyList(this.token).subscribe(
      (data) => {        
        if (data && data.data && data.data.companyList && Array.isArray(data.data.companyList)) {
          this.companyList = data.data.companyList;
          //           if (this.companyList.length > 0) {
          //   this.selectedCompany = this.companyList[0]; // Select first company by default
          // }
        } else {
          this.companyList = [];
          console.error('companyList is missing or not an array');
        }   
      },
      (error) => {
        console.error('Error fetching company list:', error);
        this.companyList = [];
      }
    );
  }  
  

  onCompanyChange() {      
    if (!this.selectedCompany || !this.selectedCompany.cieCode) {
      console.warn('No company selected');
      return;
    }
    const cieCode = this.selectedCompany.cieCode;
    const bkiCurrency = null;
    
    this.transactionFormService.getBankAccountList(cieCode, bkiCurrency,this.token).subscribe(
      (data: any) => {
        if (data && data.data && data.data.bkAccountList) {
          console.log('Bank account list fetched:', data);
          this.bankAccountList = data.data.bkAccountList || [];
        } else {
          this.bankAccountList = [];
          console.error('Bank account is missing or not an array');
        }
      },
      (error) => {
        console.error('Error fetching bank account list:', error);
        this.bankAccountList = [];
      }
    );
  }  
  
openManualAllocationModal(): void {
    const dialogRef = this.dialog.open(ManualAllocationPopupComponent, {
      width: '800px',
    });

    dialogRef.afterClosed().subscribe(result => {

      console.log('The dialog was closed');
    });
  }

}