import {  Component, OnInit, ViewChild, AfterViewInit, input } from '@angular/core';
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
import { BreakpointObserver } from '@angular/cdk/layout';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NotificationPopupService } from '../notification-popup/notification-popup.service';

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
    // 'mvtType',
    // 'mvtUserReconciled',
    // 'mvtDtLastUpdate',
    // 'mvtDtUser',
    // 'PIStatus',
    // 'mvtlRef',
    // 'mvtDtCreated',
    // 'bkiAccountName',
    // 'cieDesc',
    // 'notes',
    // 'allocation',
    // 'validate',
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
  //internalCompany: string = '';
  bankAccount: string = '';
  // mvtTypeList: string[] = ['PrevDay', 'IntraDay']; // Replace with actual values
  // mvtType: string = '';
  loading: boolean = false;
  IsRecordAllocated = false;
  IsRecordValidated =false
  money = true;
  totalRecords: number = 0;
  ciecode : any = null;
  
  token: string = '';
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<TransactionForm>([]);
  constructor(private dialog: MatDialog, private transactionFormService: TransactionFormService,private breakpointObserver: BreakpointObserver,  @Inject(PLATFORM_ID) private platformId: object,  public notificationService: NotificationPopupService) { }

  ngOnInit() {

    this.breakpointObserver.observe(['(max-width: 700px)']).subscribe((result) => {
      if (result.matches) {
  
   this.displayedColumns = [
          
    'actions',
    'mvtDate',
    'mvtValueDate',
    'refRem',
    'mvtAmountSent',
    'mvtAmountRcvd',
    'mvtCurrency',
    'mvtBkAccount',
    // 'mvtType',
    // 'bkiAccountName',
    // 'allocation',
    // 'validate',
  ];

      } else {
        // Desktop view: Default order
        this.displayedColumns = [
           //'mvtID',
    //'mvtKey',
    'mvtDate',
    'mvtValueDate',
    'refRem',
    'mvtAmountSent',
    'mvtAmountRcvd',
    'mvtCurrency',
    'mvtBkAccount',
    // 'mvtType',
    // 'bkiAccountName',
    // 'allocation',
    // 'validate',
    'actions'
        
        ];
      }
    });


if (isPlatformBrowser(this.platformId)) {
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
}


  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => {
      this.pageIndex = 0;
      this.loadInvoices();
    });
  }

  loadInvoices() {
  
    
    const SortColumn = this.sort?.active || '';
    const SortDirection = this.sort?.direction || '';

    if (this.selectedCompany) {
      this.ciecode = this.selectedCompany?.cieCode;
    }
  
    this.loading = true;
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
        this.selectedBankAccount,
        this.money,
        this.IsRecordAllocated,
        this.token
      )
      .subscribe({
        next: (response: any) => {
          console.log('API Response:', response);

          this.dataSource = new MatTableDataSource(response.data.data);
          console.log(this.dataSource)
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

  openAllocationModal(invoiceData: any, autoFocus: boolean = false): void {
    console.log("Opening modal with cieCode:", this.ciecode);
    this.loading = true
   
    if (invoiceData.isRecordValidated == false) {
      this.loading = false
      this.notificationService.showNotification(
        'You can not allocate this line as its not yet validated.',
        'WARNING',
        'warning',
        () => { console.log('Please validate first') }
      );
      //  return;
    }
    else {
      this.loading =false
      this.dialog.open(RemittanceAllocationComponent, {
        data: { invoiceData, cieCode: this.ciecode },
        autoFocus: autoFocus
      });

    }
  }

  applyFilter(form: any): void {
    this.loading = true
    if (!this.selectedCompany || !this.selectedCompany.cieCode) {
      this.loading = false
      this.notificationService.showNotification(
        'Please select a company and a bank account before proceeding.',
        'WARNING',
        'warning',
        () => { console.log('Please validate first') 
        
        }
      );
    }
    console.log("Filtering with form:", form);
    this.loadInvoices();
  }

  validateRecord(mvtKey: number): void {
    console.log('Validating record with ID:', mvtKey);
  this.loading = true
    if (mvtKey === null || mvtKey === undefined || mvtKey === 0) {
      console.error('Invalid ID:', mvtKey);
      return;  // Stop execution if the ID is invalid
    }
  
    this.transactionFormService.ValidateManualBankAllocation(mvtKey).subscribe(
      (response) => {
        this.loading = false
        this.loadInvoices();
        console.log('Validation successful:', response);
      },
      (error) => {
        this.loading = false
        console.error('Error during validation:', error);
      }
    );
  }
  
  


  ClearSearch() {
    this.pageIndex = 0;
    console.log("clearsearch clicked")
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
    const selectedCompany = this.selectedCompany?.cieDesc;
    const selectedBankAccount = this.selectedBankAccount;
    if (this.selectedCompany && this.selectedBankAccount) {
    const dialogRef = this.dialog.open(ManualAllocationPopupComponent, {
      width: '800px',
      data: { company : selectedCompany ,bankAccount: selectedBankAccount, applyFilterFn: (form: any) => this.applyFilter(form) }
    });
  
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }
  else {
        console.log('Please select a company and a bank account before proceeding.');
      }
    }
  

 

}