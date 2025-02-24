import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { RemittanceAllocationComponent } from '../remittance-allocation/remittance-allocation.component';
import { MatDialog } from '@angular/material/dialog';
import { TransactionFormService } from '../transaction-form/transaction-form.service';
import { MatTableDataSource } from '@angular/material/table';
import { TransactionForm } from './transaction-form';
import { MatSort } from '@angular/material/sort';

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
    'mvtAmountSent',
    'mvtAmountRcvd',
    'mvtCurrency',
    'mvtReconciled',
    'mvtBkClearing',
    'mvtBkAccount',
    'mvtType',
    'mvtUserReconciled',
    'mvtDtLastUpdate',
    'mvtDtUser',
    'PIStatus',
    'mvtlRef',
    'mvtDtCreated',
    'bkiAccountName',
    'cieDesc',
    'actions'
  ];

  Company: number = 0;
  BankAccount: string | null = null;
  TypesOfMovements: number = 0;
  Money: number = 0;
  BankDateFrom: Date | null = null;
  BankDateTo: Date | null = null;
  Currency: string | null = null;
  BatchType: string | null = null;
  originalData: any[] = [];
  filteredData: any[] = []; 

  searchCriteria = {
    mvtKey: '',
    mvtDate: '',
    mvtDtCreated: '',
    mvtAmountRcvd:''
  };


   dataSource = new MatTableDataSource<TransactionForm>([]);

   @ViewChild(MatSort) sort!: MatSort;

  constructor(private dialog: MatDialog, private transactionFormService: TransactionFormService) {}
  ngOnInit() {
    this.loadInvoices();
  }  


 ngAfterViewInit() {
    setTimeout(() => {
      console.log('MatSort:', this.sort);
      this.dataSource.sort = this.sort;
    });
  }
  
  loadInvoices() {
    const formattedBankDateFrom: Date | null = new Date('2021-01-01T00:00:00');
    const formattedBankDateTo: Date | null = new Date('2023-06-28T00:00:00');
  
    console.log('Formatted Dates:', formattedBankDateFrom, formattedBankDateTo); // Debugging
  
    this.transactionFormService
      .getTransaction(
        this.Company,
        this.BankAccount,
        this.TypesOfMovements,
        this.Money,
        formattedBankDateFrom,
        formattedBankDateTo,
        this.Currency,
        this.BatchType
      )
      .subscribe({
        next: (response: any) => {
          console.log('API Response:', response);
          this.originalData = response.data.data; // Store original data
          this.filteredData = [...this.originalData]; 
          
          // Ensure data is assigned properly
          this.dataSource = new MatTableDataSource(response.data.data);
          this.dataSource.sort = this.sort;
          
          console.log('Sorted Data:', this.dataSource.data);
        },
        error: (err) => {
          console.error('API Error:', err);
        }
      });
  }
  
  openAllocationModal(invoiceData: any): void {
    this.dialog.open(RemittanceAllocationComponent, { data: invoiceData });
  }
  
  applyFilter(event: Event) {
    event.preventDefault();
  
    const formattedMvtDate = this.searchCriteria.mvtDate
      ? new Date(this.searchCriteria.mvtDate).toISOString().split('T')[0]
      : '';
  
    const formattedDateCreated = this.searchCriteria.mvtDtCreated
      ? new Date(this.searchCriteria.mvtDtCreated).toISOString().split('T')[0]
      : '';
  
    const searchObj = {
      mvtKey: this.searchCriteria.mvtKey.trim().toLowerCase(),
      mvtDate: formattedMvtDate,
      mvtDtCreated: formattedDateCreated,
      mvtAmountRcvd: this.searchCriteria.mvtAmountRcvd.trim().toLowerCase()
    };
  
    console.log('Search Criteria:', searchObj);
  
    this.filteredData = this.originalData.filter((item: any) => {
      const mvtKeyMatch = searchObj.mvtKey
        ? String(item.mvtKey || '').toLowerCase().includes(searchObj.mvtKey)
        : true;
  
      const mvtDateMatch = searchObj.mvtDate
        ? item.mvtDate 
          ? item.mvtDate.split('T')[0] === searchObj.mvtDate
          : false
        : true;
  
      const dateCreatedMatch = searchObj.mvtDtCreated
        ? item.mvtDtCreated 
          ? item.mvtDtCreated.split('T')[0] === searchObj.mvtDtCreated
          : false
        : true;

        const mvtAmountMatch = searchObj.mvtAmountRcvd
        ? String(item.mvtAmountRcvd || '').toLowerCase().includes(searchObj.mvtAmountRcvd)
        : true;
  
      return mvtKeyMatch && mvtDateMatch && dateCreatedMatch && mvtAmountMatch;
    });
  
    console.log('Filtered Data:', this.filteredData);
  
    // Update Grid
    this.dataSource.data = this.filteredData;
  }
  
  ClearSearch() {
    this.searchCriteria = { mvtKey: '', mvtDate: '', mvtDtCreated: '',mvtAmountRcvd:'' };
    this.filteredData = [...this.originalData];
    this.dataSource.data = this.filteredData;
  }
}