import { Component, HostListener, Inject, OnInit,ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from '../constant/api-constants';
import { NotificationPopupService } from '../notification-popup/notification-popup.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { startWith} from 'rxjs/operators';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';

@Component({
  selector: 'app-remittance-allocation',
  templateUrl: './remittance-allocation.component.html',
  styleUrls: ['./remittance-allocation.component.css']
})
export class RemittanceAllocationComponent implements OnInit {
  @ViewChild(MatAutocompleteTrigger) autoTrigger!: MatAutocompleteTrigger;
  agencyControl = new FormControl('');
  filteredAgencies!: Observable<{ agecode: string; agedesc: string }[]>;
  allAgencies: { agecode: string; agedesc: string }[] = []; // Store default list
  isDropdownOpen = false; 

  displayedColumns: string[] = [
    'allocationType', 'item', 'amountToAllocate', 'agencyCommission', 
    'ourFee', 'contractorDue', 'vat', 'dueByAg', 'bankCharges', 
    'taxWithheld', 'factoring', 'pendingLeftDue'
  ];

  // Agency: string | null = null;
  // Agencyarr: { agecode: string; agedesc: string }[] = [];
  showAllocation = false;
  Agency: string | null = null;
  Agencyarr: any[] = [];
  dataSource: any[] = [];
  pageSize: number = 20;
  PageNumber: number = 1;
  SearchTerm: string = '';
  isLoading: boolean = false;
  showDropdown: boolean = false;
  token : string = '';
  allocationarr: any[] = [];
  invoice: any | null = null;
  invoicearr: any[] = [];
  bkAccount: string = '';
  currency : string = '';
  cieCode: any;
  selectedAgency : any;
  selectedAgencyCode: string | number | null = null;

  selectedAgencyDesc: string = '';

  allocationData = {
    type: '',
    item: '',
    amount: '',
    agencyCommission: '0',
    ourFee: '0',
    contractorDue: '0',
    vat: '0',
    description: '',
    dueByAgency: '0',
    bankChargesCon: '0',
    bankChargesAf : '0',
    taxWithheld: '0',
    factoring: '0',
    pendingDue: '0',
    extraDescription: ''
  };

  constructor(
    private dialogRef: MatDialogRef<RemittanceAllocationComponent>,
    public notificationService: NotificationPopupService,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public invoiceData: any
  ) {
    this.bkAccount = invoiceData.invoiceData.mvtBkAccount;
    this.currency = invoiceData.invoiceData.mvtCurrency;
    this.cieCode = invoiceData.cieCode;
    console.log('Anmol',this.bkAccount,this.currency,this.cieCode)
  }

  ngOnInit(): void {
    console.log('invoice Date', this.invoiceData)
    this.getAllocationType() ;
    this.fetchAgencyList('').subscribe(agencies => {
      this.allAgencies = agencies;
    });
    this.filteredAgencies = this.agencyControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => this._filterAgencies(value || ''))
    );
  }

  getAllocationType() {
    const apiUrl = environment.API_BASE_URL + 'OCRAI/GetAllocationTypeListData';
    this.notificationService.setNotificationVisibility(true);
  
    const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
    });
  
    this.http.post<any>(apiUrl, {}, { headers }).subscribe({
        next: (data) => {
          console.log(data.data.allocationList)
          this.allocationarr = data.data.allocationList;
        },
        error: (error) => {
            console.error("Error Response:", error);        
        },
    });
  }
  
  toggleAllocation() {
    this.showAllocation = !this.showAllocation;

  }

  addAllocation() {
    console.log('Allocation Added:', this.allocationData);
    alert('Allocation data saved successfully!');
  }

  resetAllocation() {
    this.allocationData = {
      type: '',
      item: '',
      amount: '',
      agencyCommission: '0',
      ourFee: '0',
      contractorDue: '0',
      vat: '0',
      description: '',
      dueByAgency: '0',
      bankChargesCon: '0',
      bankChargesAf : '0',
      taxWithheld: '0',
      factoring: '0',
      pendingDue: '0',
      extraDescription: ''
    };
  }
  autoSplit() {
    alert('Auto Split functionality not implemented yet!');
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  onInvoiceDataBind() {

    const formData = {
      AgeCode: this.selectedAgency,
      CieCode: this.cieCode,
      BkiAccountNb: this.bkAccount,
      MvtCurrency: this.currency
    };
    
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
  
    const apiUrl = environment.API_BASE_URL + 'OCRAI/GetInvoiceListData';
    this.http.post<any>(apiUrl, formData, { headers }).subscribe({
      next: (data) => {
        console.log(data.data.invoiceList)
        this.invoicearr = data.data.invoiceList;
      },
      error: (error) => {
          console.error("Error Response:", error);        
      },
  });
  }

  private _filterAgencies(value: string): Observable<{ agecode: string; agedesc: string }[]> {
    const filterValue = value.toLowerCase().trim();

    if (!filterValue) {
      return of(this.allAgencies); // Show default list when input is empty
    }

    return this.fetchAgencyList(filterValue);
  }

  fetchAgencyList(searchTerm: string): Observable<{ agecode: string; agedesc: string }[]> {
    const apiUrl = `${environment.API_BASE_URL}OCRAI/GetAgencyListData`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const body = {
      SearchTerm: searchTerm,
      PageNumber: 1,
      PageSize: 10
    };

    return this.http.post<any>(apiUrl, body, { headers }).pipe(
      map(data => {
        console.log('API Response:', data);
        this.allAgencies = data.data.agencyList;
        return Array.isArray(data?.data?.agencyList) ? data.data.agencyList : [];
      })
    );
  }

  displayAgency(agency?: { agecode: number; agedesc: string }): string {
    return agency ? agency.agedesc : '';
  }

  onInputClick(): void {
    if (this.autoTrigger) {
      this.autoTrigger.openPanel();
      this.isDropdownOpen = true
    }
  }

  async onOptionSelected(event: MatAutocompleteSelectedEvent): Promise<void> {
    const selectedAgedesc = event.option.value.trim();

    const selectedAgency = this.allAgencies.find(agency => 
      agency.agedesc.trim().toLowerCase() === selectedAgedesc.toLowerCase()
    );
  
    if (selectedAgency) {
      this.selectedAgency = selectedAgency.agecode;
      this.selectedAgencyDesc = selectedAgency.agedesc;
      console.log("Selected Agency Code:", this.selectedAgency);
    } else {
      console.warn("No matching agency found!");
    }
  
    this.onInvoiceDataBind();
  }
  
}
