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
    'MvtDate',
    'MvtValueDate',
    'MvtDateReconciled',
    'RefRem',
    'MvtCurrency',
    'MvtAmountSent',
    'mvtAmountRcvd',
    'MvtReconciled',
    'MvtBkClearing',
    'MvtBkAccount',
    'MvtType',
    'MvtUserReconciled',
    'MvtDtLastUpdate',
    'MvtDtUser',
    'PIStatus',
    'MvtlRef',
    'MvtDtCreated',
    'BkiAccountName',
    'CieDesc',
    'actions'
  ];
  @ViewChild(MatSort) sort!: MatSort;

  Company: number = 0;
  BankAccount: string | null = null;
  TypesOfMovements: number = 0;
  Money: number = 0;
  BankDateFrom: Date | null = null;
  BankDateTo: Date | null = null;
  Currency: string | null = null;
  BatchType: string | null = null;
  



   dataSource = new MatTableDataSource<TransactionForm>([]);

  constructor(private dialog: MatDialog, private transactionFormService: TransactionFormService) {}
  ngOnInit() {
    console.log('ngOnInit() executed'); // Debugging
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
}