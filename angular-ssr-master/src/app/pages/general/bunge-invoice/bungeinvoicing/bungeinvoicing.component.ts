import { Component, OnInit, ViewChild, AfterViewInit, input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BungeApiService } from '../bungeinvoicing/bungeinvoicing.service';
import { afsInvoice } from '../../afsinvoices/afsinvoices.model';
import { MatDialog } from '@angular/material/dialog';
import { AfsinvoiceComponent } from '../../afsinvoice/afsinvoice.component';
import { ConfirmationPopComponent } from '../../confirmation-pop/confirmation-pop.component';
import { environment } from '../../constant/api-constants';
import { NotificationPopupService } from '../../notification-popup/notification-popup.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BreakpointObserver } from '@angular/cdk/layout';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';

@Component({
  selector: 'app-bungeinvoicing',
  templateUrl: './bungeinvoicing.component.html',
  styleUrls: ['./bungeinvoicing.component.css'],
})

export class BungeinvoicingComponent implements OnInit, AfterViewInit {
  @ViewChild('autoTrigger') autoTrigger!: MatAutocompleteTrigger;
  @ViewChild(ConfirmationPopComponent) popupComponent!: ConfirmationPopComponent;
  ContractorControl = new FormControl('');
  filteredContractors!: Observable<{ conCode: string; fullName: string }[]>;
  allContractor: { conCode: string; fullName: string }[] = [];

  displayedColumns: string[] = [
    'contractorName',
    'cFirstName',
    'cLastName',
    'startDate',
    'endDate',
    'CreatedDate',
    'totalAmount',
    'selfBillInvoiceNo',
    'errorMessage',
    'afsInvoiceStatus',
    'isExpenseOrTimesheet',
    'actions',
  ];

  dataSource = new MatTableDataSource<afsInvoice>([]);
  totalRecords: number = 0;
  pageIndex: number = 0;
  pageSize: number = 20;
  filterValue: string = '';
  name: string = '';
  invoiceno: string = '';
  startdate: string = '';
  enddate: string = '';
  IsValidatedRecord = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  tokenData: string = '';
  token: string = '';
  loading: boolean = false;
  isNotificationVisible: boolean = false;
  IsSelfBill: boolean = false;
  CsmTeam: any | null = null;
  csmTeamarr: any[] = [];
  IsAllRecord: boolean = false;
  selectedRecords: number[] = [];
  allRecords: any[] = [];
  isChecked = false;
  hideCheckBoxes: boolean = true;
  isMovedInOriginaldb: boolean = true;
  IsCompleteRecord: boolean = false;
  btnText: string = 'Validate';
  defaultContractor: { conCode: string; fullName: string }[] = [];
  Contractor: string | null = null;
  Contractorarr: any[] = [];
  isDropdownOpen = false;
  selectedContractor: string = '';
  internalInvoiceType: any | null = '1';
  internalInvoiceTypeArr = [
    { cmCode: '1', cmDesc: 'Service Invoices' },
    { cmCode: '2', cmDesc: 'Other Invoices' }
  ];
  
  currency: any | null = null;
  currencyArr: any[] = [];
  filteredContractOptions: { contracts: string; ctcCode: string }[] = [];
  selectedFilteredContract: string = '';
  conCode: string = "";

  constructor(private BungeApiService: BungeApiService, private dialog: MatDialog, public notificationService: NotificationPopupService, private http: HttpClient, private breakpointObserver: BreakpointObserver) { }

  ngOnInit() {

    this.breakpointObserver.observe(['(max-width: 700px)']).subscribe((result) => {
      if (result.matches) {
        this.displayedColumns = [
          'actions',
          'contractorName',
          'cFirstName',
          'cLastName',
          'startDate',
          'endDate',
          'totalAmount',
          'selfBillInvoiceNo',
          'errorMessage',
          'afsInvoiceStatus',
          'isExpenseOrTimesheet'

        ];

      } else {
        this.displayedColumns = [
          'contractorName',
          'cFirstName',
          'cLastName',
          'CreatedDate',
          'totalAmount',
          'selfBillInvoiceNo',
          'errorMessage',
          'afsInvoiceStatus',
          'isExpenseOrTimesheet',
          'CsmTeam',
          'actions',

        ];
      }
    });

    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.token = storedToken;
    } else {
      console.error('Token not found in localStorage.');

    }

    this.fetchContractorList('').subscribe(contractors => {
      this.allContractor = contractors;
      this.defaultContractor = contractors;
      this.filteredContractors = of(contractors);
    });


    this.ContractorControl.valueChanges.subscribe(value => {
      
      if (!value || value.trim() === '') {
        console.log('Input Cleared - Showing Default List');

        this.allContractor = [...this.defaultContractor];
        this.filteredContractors = of(this.defaultContractor);

        this.filteredContractors.subscribe(data => {
          console.log('Updated Filtered Contractor:', data);
        });
      } else {
        this.filteredContractors = this._filterContractor(value);
      }
    });

    this.loadInvoices();
    this.getCsmTeam();
    this.getCurrency();
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

    this.BungeApiService
      .getInvoices(this.pageIndex, this.pageSize, SortColumn, SortDirection, this.name, this.invoiceno, this.startdate, this.enddate, this.CsmTeam, this.selectedFilteredContract, this.selectedContractor, this.internalInvoiceType, this.currency, this.token)
      .subscribe({
        next: (response: any) => {
          this.allRecords = response.data.data;
          this.dataSource.data = response.data.data;
          console.log(" Incoming Data from API:", this.allRecords);
          this.totalRecords = response.data.totalRecords;
          if (this.allRecords.length > 0) {
            this.isMovedInOriginaldb = this.allRecords[0].isMovedInOriginaldb;
          } else {
            this.isMovedInOriginaldb = false;
          }
          if (this.isMovedInOriginaldb) {
            this.btnText = 'Validated';
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('API Error:', err);
          this.loading = false;
        },
      });
  }

  onPageChanged(event: any) {

    if (this.pageSize !== event.pageSize) {

      this.pageSize = event.pageSize;
      this.pageIndex = 0;
      this.IsAllRecord = false

    } else {

      this.pageIndex = event.pageIndex;
      this.IsAllRecord = false
      this.selectedRecords = [];
    }

    this.loadInvoices();
  }

  openInvoiceModal(invoiceData: any): void {

    const dialogRef = this.dialog.open(AfsinvoiceComponent, {
      width: '800px',
      data: invoiceData,
    });

    dialogRef.afterClosed().subscribe(result => {

      this.name = this.name;
      this.invoiceno = this.invoiceno;
      this.startdate = this.startdate;
      this.enddate = this.enddate;

      this.loadInvoices();

      console.log('The dialog was closed');
    });
  }

  SearchResults(form: any): void {

    this.pageIndex = 0;
    this.name = this.name;
    this.invoiceno = this.invoiceno;
    this.startdate = this.startdate;
    this.enddate = this.enddate;
    this.IsValidatedRecord = this.IsValidatedRecord;
    this.isChecked = this.isChecked;
    this.hideCheckBoxes = true;

    this.loadInvoices();
  }

  private _filterContractor(value: string): Observable<{ conCode: string; fullName: string }[]> {
    const filterValue = value.toLowerCase().trim();
    
    if (!filterValue) {
      return of(this.allContractor);
    }

    return this.fetchContractorList(filterValue);
  }

  filterContractData(): void {
    this.filteredContractOptions = [];
    this.selectedFilteredContract = '';
    
    if (this.allContractor) {
      this.conCode = this.conCode;
    }
    const apiUrl = environment.API_BASE_URL + 'OCRAI/GetAFSBungeContactDropdownDat';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    
    const body = {
      CtcCode: this.conCode
    };
    this.http.post<any>(apiUrl, body, { headers }).subscribe(
      (response) => {
        debugger

        console.log(response);
        if (response?.data?.contractsList) {
          debugger
          this.filteredContractOptions = response?.data?.contractsList;
        }
      },
      (error) => {
        console.error('Error fetching contractor options:', error);
      }
    );
  }

  fetchContractorList(searchTerm: string): Observable<{ conCode: string; fullName: string }[]> {
    const apiUrl = `${environment.API_BASE_URL}OCRAI/GetAFSBungeContractorDat`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const body = {
      fullName: searchTerm
    };
    return this.http.post<any>(apiUrl, body, { headers }).pipe(
      map(data => {
        let contractsList = Array.isArray(data?.data?.contractsList) ? data.data.contractsList : [];
        if (!contractsList.length) {
          contractsList = this.allContractor;
        }

        this.allContractor = contractsList;
        return contractsList;
      })
    );
  }

  onInputClick(): void {
    if (!this.ContractorControl.value) {
      this.filteredContractors = of(this.allContractor);
    }

    if (this.autoTrigger) {
      this.autoTrigger.openPanel();
      this.isDropdownOpen = true;
    }
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedcont = event.option.value.trim();

    const selectedAgency = this.allContractor.find(contractor =>
      contractor.fullName.trim().toLowerCase() === selectedcont.toLowerCase()
    );

    if (selectedAgency) {
      this.conCode = selectedAgency.conCode;
      this.filterContractData();

    } 
    else {
      console.warn("⚠️ No matching agency found!");
    }
  }

  ClearSearch(): void {

    this.pageIndex = 0;
    this.name = '';
    this.invoiceno = '';
    this.startdate = '';
    this.enddate = '';
    this.IsValidatedRecord = false;
    this.CsmTeam = null;
    this.IsSelfBill = false;
    this.IsAllRecord = false
    this.selectedRecords = []
    this.hideCheckBoxes = true;
    this.IsCompleteRecord = false;
    this.btnText = 'Validate';
    const startDateInput = document.getElementById('startdate') as HTMLInputElement;
    const endDateInput = document.getElementById('enddate') as HTMLInputElement;

    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';


    this.loadInvoices();
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }

  getLimitedWords(text: string, wordLimit: number): string {
    if (!text) return '';
    const words = text.split(' ');
    return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') + '...' : text;
  }


  onDownloadInvoice(row: any) {
    const invoiceID = row.afsInvoiceStatus;
    const isAdminorContractor = 1;
    this.loading = true;
    this.BungeApiService.generateInvoicePDF(invoiceID, isAdminorContractor, this.token).subscribe(
      (response: any) => {
        ;
        if (response.succeeded) {
          const pdfPath = response.messages[0];
          this.loading = false;
          if (pdfPath) {
            console.log("pdfPath : " + pdfPath)
            const fullPdfUrl = environment.API_UAT_Invoice_URL + `${pdfPath.replace(/\\/g, '/')}`;

            const link = document.createElement('a');
            link.setAttribute('target', '_blank');
            link.setAttribute('href', fullPdfUrl);
            document.body.appendChild;
            link.click();
            link.remove();

          }
          else {
            this.loading = false;
          }

        }
        else {
          alert('We are unable to display the invoice file. Please contact the system administrator.');
          this.loading = false;
        }
      },
      (error) => {
        console.error('Error generating invoice:', error);
        alert('An error occurred while generating the invoice.');
        this.loading = false;
      }
    );
  }

  changeblur(event: any) {
    this.IsAllRecord = false
    this.selectedRecords = []
    if (!this.IsValidatedRecord && this.isMovedInOriginaldb) {
      this.hideCheckBoxes = false;

    }
  }

  toggleAllRecords(event: any) {
    this.IsAllRecord = event.target.checked;
    setTimeout(() => {
      if (!this.allRecords || this.allRecords.length === 0) {
        console.warn(" No records found in allRecords!");
        this.selectedRecords = [];
        return;
      }

      if (this.IsAllRecord) {
        this.selectedRecords = this.allRecords
          .filter(row => row.isErrorOnRow !== 1)
          .map(row => row.id);
      } else {
        this.selectedRecords = [];
      }

      this.selectedRecords = [...this.selectedRecords];
    }, 500);
  }

  onCheckboxChange(event: any, id: number) {
    if (event.target.checked) {
      this.selectedRecords.push(id);
    } else {
      this.selectedRecords = this.selectedRecords.filter(recordId => recordId !== id);

      this.IsAllRecord = false;
    }

    this.selectedRecords = [...this.selectedRecords];

  }

  openBatchValidateConfirmationBox() {
    if (!this.selectedRecords || this.selectedRecords.length === 0) {
      this.notificationService.showNotification(
        'Please select at least one record to batch validate.',
        'WARNING',
        'warning',
        () => { console.log('User acknowledged warning') }
      );
      return;
    }
    else {

      this.popupComponent.openPopup(
        'Confirmation',
        'Are you sure that you want to proceed?',
        'warning',
        () => {
          console.log('Yes action clicked!');
          this.BatchValidate();
        },
        () => {
          console.log('No action clicked!');
        }
      );
    }
  }

  BatchValidate() {
    this.loading = true;

    const apiUrl = environment.API_BASE_URL + 'OCRAI/SelfBillBatchValidate';
    this.notificationService.setNotificationVisibility(true);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    console.log("Headers:", headers);

    const body = {
      selectedIds: this.selectedRecords,
      IsAllRecord: this.IsAllRecord
    };

    console.log("Payload Sent to API:", body);

    this.http.post<any>(apiUrl, body, { headers }).subscribe({
      next: (response) => {
        console.log('con ID', response.data[0].statusMsg);

        if (response?.data?.length > 0) {
          this.loading = false;

          if (response.data[0].status === 4 && response.data[0].statusMsg == "") {
            this.notificationService.showNotification(
              'Records have been validated and processed successfully. The updates have been applied to those that meet the criteria.',
              'INFORMATION',
              'success',
              () => {
                console.log('OK clicked 4');
                this.notificationService.setNotificationVisibility(false);
                window.location.reload();
              }
            );
          }

          if (response.data[0].statusMsg && response.data[0].statusMsg.length > 0) {
            this.notificationService.showNotification(
              `Validation was successful for some records, but failed for records associated with ${response.data[0].statusMsg}. Please review and correct these records individually, then revalidate.`,
              'INFORMATION',
              'warning',
              () => {
                console.log('OK clicked with issues');
                this.notificationService.setNotificationVisibility(false);
                window.location.reload();
              }
            );
          }
        }
      },
      error: (error) => {
        console.error("Error Response:", error);
        this.loading = false;
        this.notificationService.showNotification(
          'Unable to complete the action. Please retry.',
          'ERROR',
          'error',
          () => {
            console.log('Error callback');
            this.notificationService.setNotificationVisibility(false);
          }
        );
      },
    });
  }

  getCsmTeam() {
    const apiUrl = environment.API_BASE_URL + 'OCRAI/GetCsmTeamData';
    this.notificationService.setNotificationVisibility(true);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    this.http.post<any>(apiUrl, {}, { headers }).subscribe({
      next: (data) => {
        this.csmTeamarr = data.data.csmTeamList;
      },
      error: (error) => {
        console.error("Error Response:", error);
      },
    });
  }

  getCurrency() {
    const apiUrl = environment.API_BASE_URL + 'OCRAI/GetCurrencyListData';
    this.notificationService.setNotificationVisibility(true);
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
  
    this.http.post<any>(apiUrl, {}, { headers }).subscribe({
      next: (data) => {
        this.currencyArr = data.data.currencyList;
  
        if (this.currencyArr.length > 0) {
          this.currencyArr = data.data.currencyList;
        }
      },
      error: (error) => {
        console.error("Error Response:", error);
      },
    });
  }
}
