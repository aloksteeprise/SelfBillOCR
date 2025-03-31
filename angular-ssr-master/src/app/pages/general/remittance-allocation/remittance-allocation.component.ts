import { Component, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from '../constant/api-constants';
import { NotificationPopupService } from '../notification-popup/notification-popup.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { startWith } from 'rxjs/operators';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';

@Component({
  selector: 'app-remittance-allocation',
  templateUrl: './remittance-allocation.component.html',
  styleUrls: ['./remittance-allocation.component.css']
})
export class RemittanceAllocationComponent implements OnInit {
  @ViewChild('autoTrigger') autoTrigger!: MatAutocompleteTrigger;
  agencyControl = new FormControl('');
  filteredAgencies!: Observable<{ agecode: string; agedesc: string }[]>;
  allAgencies: { agecode: string; agedesc: string }[] = [];


  displayedColumns: string[] = [
    'allocationType', 'item', 'amountToAllocate', 'agencyCommission',
    'ourFee', 'contractorDue', 'vat', 'dueByAg', 'bankCharges',
    'taxWithheld', 'factoring', 'pendingLeftDue'
  ];

  selectedInvoices: any[] = [];
  defaultAgencies: { agecode: string; agedesc: string }[] = [];
  isDropdownOpen = false;
  showAllocation = false;
  isInterCoVisible = false;
  isinterCoBankVisible = false;
  isItemVisible = true;
  // btnAddRow = true;
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
  isFieldReadOnly: boolean = true;
  invoiceDropdown : any |null = null;
  interCoCompany: any | null = null;
  interCoCompanyarr: any[] = [];
  interCoBank: any | null = null;
  interCoBankarr: any[] = [];
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
  bankChargesAf: number = 0;
  taxWithHeld: number = 0;
  factoring: number = 0;
  pendingLeftDue: number = 0;

  selectedAgencyDesc: string = '';
  disabledFields: { [key: string]: boolean } = {};

  constructor(
    private dialogRef: MatDialogRef<RemittanceAllocationComponent>,
    public notificationService: NotificationPopupService,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public invoiceData: any
  ) {
    this.bkAccount = invoiceData.invoiceData.mvtBkAccount;
    this.currency = invoiceData.invoiceData.mvtCurrency;
    this.cieCode = invoiceData.cieCode;
    this.txtAmountAvailable = invoiceData.invoiceData.mvtAmountRcvd;
    this.txtTotalAmount = invoiceData.invoiceData.mvtAmountRcvd;

    this.disabledFields = {
      invoice: false,
      invhTotAgencyFee: true,
      invhTotOurfee: true,
      invhTotSal: true,
      invhVATI: true,
      dueByAgency: true,
      pendingLeftDue:true,
      currencyDescription:false,
      btnAddRow : false
    };
  }

  ngOnInit(): void {
    this.fetchAgencyList('').subscribe(agencies => {
      this.allAgencies = agencies;
      this.defaultAgencies = agencies;
      this.filteredAgencies = of(agencies);
    });

    this.agencyControl.valueChanges.subscribe(value => {

      if (!value || value.trim() === '') {
        console.log('Input Cleared - Showing Default List');

        this.allAgencies = [...this.defaultAgencies];
        this.filteredAgencies = of(this.defaultAgencies);

        this.filteredAgencies.subscribe(data => {
          console.log('Updated Filtered Agencies:', data);
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
        this.allocationarr = data.data.allocationList;
        if (this.invoiceDropdown && this.allocationarr.length > 1) {
          this.allocationType = this.allocationarr[0].altCode;
        } else {
          this.allocationType = null;
        }
      },
      error: (error) => {
        console.error("Error Response:", error);
      },
    });
  }

  toggleAllocation() {
    this.showAllocation = true;

    const data = {
      invhCode: this.invoiceDropdown
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const apiUrl = environment.API_BASE_URL + 'OCRAI/GetAllocationPopupList';
    if(this.invoiceDropdown){
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
    }
    this.getAllocationType();
  }

  onInvoiceChange(event: any) {
    
    if (this.invoiceDropdown) {
      this.invoice = this.invoiceDropdown;
      const selectedInvoice = this.invoicearr.find(inv => inv.invhCode === this.invoiceDropdown);

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

  onItemChange(event: any) {
    if (this.invoice) {
        const selectedInvoice = this.invoicearr.find(inv => inv.invhCode === this.invoice);

        const data = {
          invhCode: this.invoice
        };

        const headers = new HttpHeaders({
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        });
        const apiUrl = environment.API_BASE_URL + 'OCRAI/GETInoicePaidStatusData';
        this.http.post<any>(apiUrl, data, { headers }).subscribe({
          next: (data) => {
            console.log(data);
            if(data.data != ""){
              if(data.data.paidStatus == '0'){
                this.disabledFields['btnAddRow'] = true;
              }
              else{
                this.disabledFields['btnAddRow'] = false;
              }
            }
          },
          error: (error) => {
            console.error("Error Response:", error);
          },
        });

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
        this.invoicearr = data.data.invoiceList;
        console.log('invoicearr',this.invoicearr)
      },
      error: (error) => {
        console.error("Error Response:", error);
      },
    });
  }

  toggleSelection(invoice: any, event: Event) {
    event.stopPropagation(); // Prevents dropdown from closing when clicking the checkbox
    const index = this.selectedInvoices.findIndex(i => i.invhCode === invoice.invhCode);
    if (index === -1) {
      this.selectedInvoices.push(invoice);
    } else {
      this.selectedInvoices.splice(index, 1);
    }
  }
  
  isSelected(invoice: any): boolean {
    return this.selectedInvoices.some(i => i.invhCode === invoice.invhCode);
  }

  clearSelection() {
    this.selectedInvoices = [];
  }

  updateAllocationSummary() {
  debugger
    if (this.selectedInvoices && this.selectedInvoices.length > 0) {
      this.showAllocationSummery = true;
      this.showAllocation = true;
      const selectedAllocationType = "Invoice";

      if(this.txtAmountAvailable){
        this.description = 'Payment from Agency ' + this.selectedAgencyDesc;
      }
      else{
        this.description = 'Payment to Agency ' + this.selectedAgencyDesc;
      }

      this.selectedInvoices.forEach(selectedInvoice => {
        if (selectedInvoice) {
          const parts: string[] = selectedInvoice.invoiceRef.split('|').map((p: string) => p.trim());
          const invoiceItem = parts.length > 0 ? parts[0] : "";
          // Push each selected invoice into allocation summary
          this.allocationList.push({
            allocateType: selectedAllocationType,
            invoiceItem: invoiceItem,
            amountToAllocate: parts[2] || 0,
            agencyCommission: selectedInvoice.invhTotAgencyFee || 0,
            ourFee: selectedInvoice.invhTotOurfee || 0,
            contractorDue: selectedInvoice.invhTotSal || 0,
            vat: selectedInvoice.invhVATI || 0,
            descrp: this.description,
            dueByAgen:  parts[2] || 0,
            bkCharges: this.bankChargesContractor || 0,
            taxWithHeld: this.taxWithHeld || 0,
            factoring: this.factoring || 0,
            pendingLeft: this.pendingLeftDue || 0
          });
        }
      });
  
      this.calculateTotals();
      this.resetAllocation();
    } else {
      console.warn("No invoices selected!");
    }
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
        if (data?.data?.invoiceCurrList) {
          this.currencyDescriptionarr = data.data.invoiceCurrList;
        } else {
          this.currencyDescriptionarr = [];
        }
      },
      error: (error) => {
        console.error("Error Response:", error);
      },
    });
  }

  isDisabled(fieldId: string): boolean {
    return this.disabledFields[fieldId] || false;
  }

  addAllocation() {
    if (this.amountAllocate === ""){
      alert("Please enter the amount to allocate value")
      return;
    }
    if (this.invoice === ""){
      alert("Please enter the inter co value")
      return;
    }
    
    this.showAllocationSummery = true;

    const selectedAllocationType = this.allocationarr.find(
      allocation => allocation.altCode === this.allocationType
    );


    const selectedInvoice = this.invoicearr.find(inv => inv.invhCode === this.invoice);

    if (selectedInvoice) {
      const parts: string[] = selectedInvoice.invoiceRef.split('|').map((p: string) => p.trim());

      if (parts.length > 0) {
        this.invoiceItem = parts[0];
      } else {
        this.invoiceItem = "";
      }
    }

    console.log(this.allocationType, this.invoiceItem)
    // Add new allocation row
    this.allocationList.push({
      allocateType: selectedAllocationType ? selectedAllocationType.altDesc : '',
      invoiceItem: selectedInvoice ? this.invoiceItem : '',
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
  

  onAllocationChange() {
    if (this.allocationType === 'ACC') {
      this.disabledFields['invoice'] = true;
      this.disabledFields['invhTotAgencyFee'] = true;
      this.disabledFields['invhTotSal'] = true;
      this.disabledFields['invhTotOurfee'] = true;
      this.disabledFields['currencyDescription'] = true;
      this.isInterCoVisible = false;
      this.isinterCoBankVisible = false;
      this.isItemVisible = true;
      this.amountAllocate = "";
      this.invoice = null;
      this.dueByAgency = "";
      this.description = 'Payment on Account from ' + this.selectedAgencyDesc;

      return;
    }

    if (this.allocationType === 'INV') {
      this.disabledFields['invoice'] = false;
      this.disabledFields['currencyDescription'] = false;
      this.disabledFields['invhVATI'] = false;
      this.isInterCoVisible = false;
      this.isinterCoBankVisible = false;
      this.isItemVisible = true;
      this.description = 'Payment from Agency ' + this.selectedAgencyDesc;
      return;
    }

    if (this.allocationType === 'ICT') {
      this.disabledFields['currencyDescription'] = true;
      this.disabledFields['invoice'] = false;
      this.isInterCoVisible = true;
      this.isItemVisible = false;
      this.amountAllocate = "";
      this.description = 'Payment on InterCo Company from ' + this.selectedAgencyDesc;

      return;
    }

    this.isFieldReadOnly = this.allocationType === "123";
  }


  onInterCoCompanyInter() {
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
          this.interCoCompanyarr = data.data.accountList;
        } else {
          this.interCoCompanyarr = [];
        }

        console.log('interCoCompanyarr', this.interCoCompanyarr);
      },
      error: (error) => {
        console.error("Error Response:", error);
      },
    });
  }

  onInterCoCompanyBankAcc(event: any) {
    this.isinterCoBankVisible = true;
    let selectedCoCompany = null;
    if (this.interCoCompany) {
      selectedCoCompany = this.interCoCompanyarr.find(int => int.accCode === this.interCoCompany);
    }
    const formData = {
      CieCode: selectedCoCompany ? selectedCoCompany.accIntercoCie : null,
      BkiCurrency: this.currency
    };

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const apiUrl = environment.API_BASE_URL + 'OCRAI/GetInterCoBankListData';
    this.http.post<any>(apiUrl, formData, { headers }).subscribe({
      next: (data) => {
        console.log('response', data);
        if (data?.data?.interCoBankList) {
          this.interCoBankarr = data.data.interCoBankList;
        } else {
          this.interCoBankarr = [];
        }

        console.log('interCoBankarr', this.interCoBankarr);
      },
      error: (error) => {
        console.error("Error Response:", error);
      },
    });
    
  }

  private _filterAgencies(value: string): Observable<{ agecode: string; agedesc: string }[]> {
    const filterValue = value.toLowerCase().trim();

    if (!filterValue) {
      return of(this.allAgencies);
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


    return this.http.post<any>(apiUrl, body, { headers }).pipe(
      map(data => {
        let agencyList = Array.isArray(data?.data?.agencyList) ? data.data.agencyList : [];

        if (!agencyList.length) {
          agencyList = this.allAgencies;
        }

        this.allAgencies = agencyList;
        return agencyList;
      })
    );
  }

  displayAgency(agency?: { agecode: number; agedesc: string }): string {
    return agency ? agency.agedesc : '';
  }

  onInputClick(): void {
    if (!this.agencyControl.value) {
      this.filteredAgencies = of(this.allAgencies);
    }

    if (this.autoTrigger) {
      this.autoTrigger.openPanel();
      this.isDropdownOpen = true;
    }
  }

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    const selectedAgedesc = event.option.value.trim();

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
    this.onInterCoCompanyInter();
  }

 

  deleteRow(index: number) {
    this.allocationList.splice(index, 1);
    this.calculateTotals();
  }

  updateRow(row : string) {
    debugger
    console.log('update row', row);
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
