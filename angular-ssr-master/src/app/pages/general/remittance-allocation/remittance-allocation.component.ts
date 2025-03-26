import { Component, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from '../constant/api-constants';
import { NotificationPopupService } from '../notification-popup/notification-popup.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { startWith } from 'rxjs/operators';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Console, debug } from 'console';
import { coerceStringArray } from '@angular/cdk/coercion';

@Component({
  selector: 'app-remittance-allocation',
  templateUrl: './remittance-allocation.component.html',
  styleUrls: ['./remittance-allocation.component.css']
})
export class RemittanceAllocationComponent implements OnInit {
  @ViewChild('autoTrigger') autoTrigger!: MatAutocompleteTrigger;
  agencyControl = new FormControl('');
  filteredAgencies!: Observable<{ agecode: string; agedesc: string }[]>;
  allAgencies: { agecode: string; agedesc: string }[] = []; // Store default list


  displayedColumns: string[] = [
    'allocationType', 'item', 'amountToAllocate', 'agencyCommission',
    'ourFee', 'contractorDue', 'vat', 'dueByAg', 'bankCharges',
    'taxWithheld', 'factoring', 'pendingLeftDue'
  ];

  defaultAgencies: { agecode: string; agedesc: string }[] = [];
  isDropdownOpen = false;
  showAllocation = false;
  showAllocationSummery = false;
  Agency: string | null = null;
  Agencyarr: any[] = [];
  dataSource: any[] = [];
  pageSize: number = 200;
  PageNumber: number = 1;
  SearchTerm: string = '';
  isLoading: boolean = false;
  showDropdown: boolean = false;
  token: string = '';
  allocationarr: any[] = [];
  invoice: any | null = null;
  invoicearr: any[] = [];
  description: string = '';
  currencyDescriptionarr: any[] = [];
  currencyDescription: any | null = null;
  bkAccount: string = '';
  currency: string = '';
  cieCode: any;
  selectedAgency: any;
  selectedAgencyCode: string | number | null = null;
  allocationData: any = {};
  allocationType: any = {};
  amountAllocate: string = '';
  dueByAgency: string = '';


  txtAmountAvailable : number = 0;
  txtTotalAmount : string = '';
  txtAllocatedConfirmedAmount : number = 0;
  allocationList: any[] = [];
  
  allocateType: string = '';
  invoiceItem: string = '';
  amountToAllocate: number = 0;
  agencyCommission: number = 0;
  ourFee: number = 0;
  contractorDue: number = 0;
  vat: number = 0;
  descrp: string = '';
  dueByAgen: number = 0;
  bankChargesContractor: number = 0;
  bankChargesAf : number = 0;
  taxWithHeld: number = 0;
  factoring: number = 0;
  pendingLeftDue: number = 0;

  selectedAgencyDesc: string = '';

  constructor(
    private dialogRef: MatDialogRef<RemittanceAllocationComponent>,
    public notificationService: NotificationPopupService,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public invoiceData: any
  ) {
    debugger
    console.log('ak',invoiceData.invoiceData)
    this.bkAccount = invoiceData.invoiceData.mvtBkAccount;
    this.currency = invoiceData.invoiceData.mvtCurrency;
    this.cieCode = invoiceData.cieCode;
    this.txtAmountAvailable = invoiceData.invoiceData.mvtAmountRcvd;
    this.txtTotalAmount =  invoiceData.invoiceData.mvtAmountRcvd;
  }

  ngOnInit(): void {
    this.fetchAgencyList('').subscribe(agencies => {
      this.allAgencies = agencies;
      this.defaultAgencies = agencies; // ✅ Store the initial default list
      this.filteredAgencies = of(agencies); // ✅ Set initial observable list
    });

    // Subscribe to input changes
    this.agencyControl.valueChanges.subscribe(value => {
      console.log('User Input Changed:', value);

      if (!value || value.trim() === '') {
        console.log('Input Cleared - Showing Default List');

        this.allAgencies = [...this.defaultAgencies]; // ✅ Reset to the original list
        this.filteredAgencies = of(this.defaultAgencies); // ✅ Reset observable

        this.filteredAgencies.subscribe(data => {
          console.log('Updated Filtered Agencies:', data); // Log to verify
        });
      } else {
        this.filteredAgencies = this._filterAgencies(value);
      }
    });
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
        debugger
        console.log('allocationdata', data.data.allocationList)
        this.allocationarr = data.data.allocationList;
        if (this.invoice && this.allocationarr.length > 1) {
          this.allocationType = this.allocationarr[0].altCode;
        } else {
          this.allocationType = null; // Or set to a default value
        }
      },
      error: (error) => {
        console.error("Error Response:", error);
      },
    });
  }

  toggleAllocation() {
    // if (!this.invoice) {
    //   console.warn("No invoice selected!");
    //   return;
    // }
    this.showAllocation = true;

    const data = {
      invhCode: this.invoice // Use selected invoice's invhCode
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const apiUrl = environment.API_BASE_URL + 'OCRAI/GetAllocationPopupList';

    this.http.post<any>(apiUrl, data, { headers }).subscribe({
      next: (response) => {
        if (response?.data?.allocationPopupList?.length) {
          this.allocationData = response.data.allocationPopupList[0];
        } else {
          console.warn("No allocation data found");
        }
      },
      error: (error) => {
        console.error("Error fetching invoice list:", error);
      },
      complete: () => {
        console.log("API call completed.");
      }
    });
    this.getAllocationType();
  }

  onInvoiceChange(event: any) {
    if (this.invoice) {
      const selectedInvoice = this.invoicearr.find(inv => inv.invhCode === this.invoice);

      if (selectedInvoice && selectedInvoice.invoiceRef) {
        const parts: string[] = selectedInvoice.invoiceRef.split('|').map((p: string) => p.trim());

        if (parts.length > 2) {
          this.amountAllocate = parts[2];
          this.dueByAgency = parts[2];
        } else {
          this.amountAllocate = "";
          this.dueByAgency = "";
        }
      }
    } else {
      this.amountAllocate = "";
      this.dueByAgency = "";
    }
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

  onOtherCurrencyDataBind() {

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

    const apiUrl = environment.API_BASE_URL + 'OCRAI/GetInvoiceOfAgencyOtherCurrencyDate';
    this.http.post<any>(apiUrl, formData, { headers }).subscribe({
      next: (data) => {
        console.log('response', data);

        if (data?.data?.invoiceCurrList) {
          this.currencyDescriptionarr = data.data.invoiceCurrList;
        } else {
          this.currencyDescriptionarr = []; // Fallback to an empty array
        }

        console.log('InvoiceCurrList', this.currencyDescriptionarr);
      },
      error: (error) => {
        console.error("Error Response:", error);
      },
    });
  }


  bindInterCoCompany() {

    const formData = {
      CieCode: this.cieCode,
      BkiCurrency: this.currency
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const apiUrl = environment.API_BASE_URL + 'OCRAI/GetInterCoCompanyListData';
    this.http.post<any>(apiUrl, formData, { headers }).subscribe({
      next: (data) => {
        console.log('response', data);

        if (data?.data?.accountList) {
          this.currencyDescriptionarr = data.data.accountList;
        } else {
          this.currencyDescriptionarr = []; // Fallback to an empty array
        }

        console.log('InvoiceCurrList', this.currencyDescriptionarr);
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
      PageSize: 200
    };

    console.log('Fetching from API with Search Term:', searchTerm);

    return this.http.post<any>(apiUrl, body, { headers }).pipe(
      map(data => {
        console.log('API Response:', data);

        let agencyList = Array.isArray(data?.data?.agencyList) ? data.data.agencyList : [];

        if (!agencyList.length) {
          debugger
          console.warn("⚠️ API returned no data, restoring full agency list");
          agencyList = this.allAgencies; // Restore the full list when API returns empty
        }

        console.log('Updated Agency List from API:', agencyList);

        this.allAgencies = agencyList; // ✅ Ensure allAgencies is always updated
        console.log('allAgencies Updated:', this.allAgencies);

        return agencyList;
      })
    );
  }

  displayAgency(agency?: { agecode: number; agedesc: string }): string {
    return agency ? agency.agedesc : '';
  }

  onInputClick(): void {
    if (!this.agencyControl.value) {
      console.log("🔄 Input cleared - Showing default agency list");
      this.filteredAgencies = of(this.allAgencies); // Reset dropdown to default list
    }

    if (this.autoTrigger) {
      this.autoTrigger.openPanel();
      this.isDropdownOpen = true;
    }
  }


  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedAgedesc = event.option.value.trim();
    console.log('User Selected Agency:', selectedAgedesc);

    const selectedAgency = this.allAgencies.find(agency =>
      agency.agedesc.trim().toLowerCase() === selectedAgedesc.toLowerCase()
    );

    if (selectedAgency) {
      this.selectedAgency = selectedAgency.agecode;
      this.selectedAgencyDesc = selectedAgency.agedesc;

      this.description = 'Payment from Agency ' + this.selectedAgencyDesc;

    } else {
      console.warn("⚠️ No matching agency found!");
    }

    this.onInvoiceDataBind();
    this.onOtherCurrencyDataBind();
  }

  addAllocation() {
    // Input Validation (No Negative Values)
    // const invalidFields = [
    //   { name: 'Amount to Allocate', value: this.amountToAllocate },
    //   { name: 'Agency Commission', value: this.allocationData?.invhTotAgencyFee },
    //   { name: 'Our Fee', value: this.allocationData?.invhTotOurfee },
    //   { name: 'Contractor Due', value: this.allocationData?.invhTotSal },
    //   { name: 'VAT', value: this.allocationData?.invhVATI },
    //   { name: 'Bank Charges Contractor', value: this.bankChargesContractor },
    //   { name: 'Tax Withheld', value: this.taxWithHeld },
    //   { name: 'Pending Left Due', value: this.pendingLeftDue }
    // ];
    
    // // Validate all fields
    // for (const field of invalidFields) {
    //   if (field.value === null || field.value === undefined || isNaN(field.value)) {
    //     alert(`${field.name} is required and must be a valid number.`);
    //     return;
    //   }
    
    //   if (field.value < 0) {
    //     alert(`${field.name} should not be negative.`);
    //     return;
    //   }
    // }
   this.showAllocationSummery = true;

const selectedAllocationType = this.allocationarr.find(
  allocation => allocation.altCode === this.allocationType
);


const selectedInvoice = this.invoicearr.find(inv => inv.invhCode === this.invoice);

if(selectedInvoice){
  const parts: string[] = selectedInvoice.invoiceRef.split('|').map((p: string) => p.trim());

  if (parts.length > 0) {
    this.invoiceItem = parts[0];
  } else {
    this.invoiceItem = "";
  }
}

console.log(this.allocationType , this.invoiceItem)
    // Add new allocation row
    this.allocationList.push({
      allocateType: selectedAllocationType ? selectedAllocationType.altDesc : '',
      invoiceItem: selectedInvoice ? this.invoiceItem : '' ,
      amountToAllocate: this.amountAllocate || 0,
      agencyCommission: this.allocationData.invhTotAgencyFee || 0,
      ourFee: this.allocationData.invhTotOurfee || 0,
      contractorDue: this.allocationData.invhTotSal || 0,
      vat: this.allocationData.invhVATI || 0,
      descrp: this.description,
      dueByAgen: this.dueByAgency || 0,
      bkCharges: this.bankChargesContractor || 0,
      taxWithHeld: this.taxWithHeld || 0,
      factoring: this.factoring || 0,
      pendingLeft: this.pendingLeftDue || 0
    });

    this.calculateTotals();
    this.resetAllocation();
  }

  deleteRow(index: number) {
    this.allocationList.splice(index, 1);
    this.calculateTotals();
  }

  updateRow(index: number) {
    alert('Not Implemented yet')
  }

  calculateTotals() {
    const totalAllocated = this.allocationList.reduce((sum, row) => sum + parseFloat(row.amountToAllocate || 0), 0);
  
    this.txtAllocatedConfirmedAmount = totalAllocated.toFixed(2);
    this.txtTotalAmount = (this.txtAmountAvailable - totalAllocated).toFixed(2);

  }
  

  resetAllocation() {
    this.allocationType = null;
    this.invoice = null;
    this.amountAllocate = '';
      this.allocationData = {
      invhTotAgencyFee: 0,
      invhTotOurfee: 0,
      invhTotSal: 0,
      invhVATI: 0,
    };
  
    this.dueByAgency = '';
    this.description = '';
    this.currencyDescription = null;
  }

}
