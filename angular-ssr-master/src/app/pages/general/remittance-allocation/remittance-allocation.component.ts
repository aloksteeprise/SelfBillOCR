import { Component, HostListener, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
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
import { ConfirmationPopComponent } from '../confirmation-pop/confirmation-pop.component';
import { debug } from 'node:console';
import { isPlatformBrowser } from '@angular/common';
import {AllocateToInvoiceItem} from './remittance-allocation';

@Component({
  selector: 'app-remittance-allocation',
  templateUrl: './remittance-allocation.component.html',
  styleUrls: ['./remittance-allocation.component.css']
})
export class RemittanceAllocationComponent implements OnInit {
  @ViewChild('autoTrigger') autoTrigger!: MatAutocompleteTrigger;
  @ViewChild(ConfirmationPopComponent) popupComponent!: ConfirmationPopComponent;
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
  invoiceDropdown: any | null = null;
  interCoCompany: any | null = null;
  interCoCompanyarr: any[] = [];
  interCoBank: any | null = null;
  interCoBankarr: any[] = [];
  txtAmountAvailable: number = 0;
  txtTotalAmount: string = '';
  txtAllocatedConfirmedAmount: number = 0;
  btnSubmitAllocVisible: boolean = true;
  allocationList: any[] = [];
  hdctcIs3Tier: number = 0;
  hdctcIsFactoring: number = 0;
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
  btnText: string = 'Add';
  editIndex: number = -1;
  selectedAgencyDesc: string = '';
  disabledFields: { [key: string]: boolean } = {};
  isAutoSplit: boolean = false;
  isConfPopupOpen :boolean = false;
  hdFlag : string = "0";
  debitAmount : number = 0;
  mvtKey : number = 0;
  mvtID: number = 0;
  mvtDate : string = "";
  refRem : string = "";
  bankCode : number = 0;
  userName : any = null;
  allocateToInvoiceList: AllocateToInvoiceItem[] = [];



  constructor(
    private dialogRef: MatDialogRef<RemittanceAllocationComponent>,
    public notificationService: NotificationPopupService,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public invoiceData: any,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {

    this.bkAccount = invoiceData.invoiceData.mvtBkAccount;
    this.currency = invoiceData.invoiceData.mvtCurrency;
    this.cieCode = invoiceData.cieCode;
    this.txtAmountAvailable = invoiceData.invoiceData.mvtAmountRcvd;
    this.txtTotalAmount = invoiceData.invoiceData.mvtAmountRcvd;
    this.debitAmount = invoiceData.invoiceData.mvtAmountSent;
    this.mvtKey = invoiceData.invoiceData.mvtKey;
    this.mvtID = invoiceData.invoiceData.mvtID;
    this.mvtDate = invoiceData.invoiceData.mvtDate;
    this.refRem = invoiceData.invoiceData.refRem;
    this.bankCode = invoiceData.bkiCode;

    this.disabledFields = {
      invoice: false,
      invhTotAgencyFee: true,
      invhTotOurfee: true,
      invhTotSal: true,
      invhVATI: true,
      dueByAgency: true,
      pendingLeftDue: true,
      currencyDescription: false,
      bankChargesContractor :false,
      bankChargesAf:false,
      taxWithHeld:false,
      factoring : false,
      btnAddRow: false
    };
  }

  ngOnInit(): void {

    if (isPlatformBrowser(this.platformId)) {
      const storedToken = localStorage.getItem('token');
      this.userName = localStorage.getItem('username');
      if (storedToken) {
        this.token = storedToken;

   // Now it's safe to call the API
        this.fetchAgencyList('').subscribe(agencies => {
          this.allAgencies = agencies;
          this.defaultAgencies = agencies;
          this.filteredAgencies = of(agencies);
        });
      } else {
        console.error('Token not found in localStorage.');
      }
    }
    this.getAllocationType();
  
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
        this.allocationarr = data.data.allocationList.slice(0, 3);
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
    if(!this.isAutoSplit){
      this.onInvoiceChange();
    }
    else{
      this.onItemChange();
    }
    this.showAllocation = true;

    const dueByAgency = Number(this.dueByAgency) || 0;

    const data = {
      invhCode: this.invoiceDropdown,
      allocatedAmount : dueByAgency - this.pendingLeftDue
    };
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const apiUrl = environment.API_BASE_URL + 'OCRAI/GetAllocationPopupList';
    if (this.invoiceDropdown) {
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
  }

  onInvoiceChange() {
    if (this.invoiceDropdown) {
      this.isInterCoVisible = false;
      this.isinterCoBankVisible = false;
      this.isItemVisible = true;

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
    this.getAllocationType();
  }

  onItemChange() {
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
          if (data.data != "") {
            if (data.data.paidStatus == '0') {
              this.disabledFields['btnAddRow'] = true;
            }
            else {
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
    if(this.invoice){
      this.isAutoSplit = true;
      this.toggleAllocation()
    }
    if (["0", 0, null, undefined, ''].includes(this.allocationData.ctcIs3Tier)) {
      this.disabledFields['invhTotAgencyFee'] = true;
      this.disabledFields['invhTotOurfee'] = true;
      this.disabledFields['invhTotSal'] = true;
    }
    else {
      this.disabledFields['invhTotAgencyFee'] = false;
      this.disabledFields['invhTotOurfee'] = false;
      this.disabledFields['invhTotSal'] = false;

    }
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
        console.log('invoicearr', this.invoicearr)
      },
      error: (error) => {
        console.error("Error Response:", error);
      },
    });
  }

  toggleSelection(invoice: any, event: Event) {
    event.stopPropagation();
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

  multiAllocationSummary() {
    if (this.selectedInvoices && this.selectedInvoices.length > 0) {
      this.showAllocationSummery = true;
      this.showAllocation = true;
      const selectedAllocationType = "Invoice";

      this.selectedInvoices.forEach(selectedInvoice => {
        if (selectedInvoice) {
          const parts: string[] = selectedInvoice.invoiceRef.split('|').map((p: string) => p.trim());
          const invoiceItem = parts.length > 0 ? parts[0] : "";

          const isDuplicate = this.allocationList.some(row => row.invoiceItem === invoiceItem);

          if (this.txtAmountAvailable) {
            this.description = 'Payment from Agency ' + this.selectedAgencyDesc;
          }

          if (isDuplicate) {
            this.notificationService.showNotification(
              `Invoice ${invoiceItem} has already been added.`,
              'INFO',
              'info',
              () => {
                this.notificationService.setNotificationVisibility(false);
                return;
              }
            );
            return;
          }
          


          this.allocationList.push({
            allocateType: selectedAllocationType,
            invoiceItem: invoiceItem,
            amountToAllocate: parts[2] || 0,
            agencyCommission: selectedInvoice.invhTotAgencyFee || 0,
            ourFee: selectedInvoice.invhTotOurfee || 0,
            contractorDue: selectedInvoice.invhTotSal || 0,
            vat: selectedInvoice.invhVATI || 0,
            descrp: `Payment of Invoice ${invoiceItem}`,
            dueByAgen: parts[2] || 0,
            bkCharges: this.bankChargesContractor || 0,
            bkChargesSMTG: this.bankChargesAf || 0,
            taxWithheld: this.taxWithHeld || 0,
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
    this.selectedInvoices = [];
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

  private isNegative(value: any) {
    return value !== "" && parseFloat(value) < 0;
  }

  addAllocation() {
    
    if (!this.allocationType) {
      return this.notificationService.showNotification("Please select Allocation Type.", "INFO", "info",() => {
        this.notificationService.setNotificationVisibility(false);
        return;
      });
    }

    if (this.allocationType === "INV" && !this.invoice) {
      return this.notificationService.showNotification("Please select an Item.", "INFO", "info",() => {
        this.notificationService.setNotificationVisibility(false);
        return;
      });
    }
    if (this.allocationType === "ICT" && !this.interCoCompany) {
      return this.notificationService.showNotification("Please select InterCo Account.", "INFO", "info",() => {
        this.notificationService.setNotificationVisibility(false);
        return;
      });
    }
    if (this.allocationType === "ICT" && !this.interCoBank) {
      return this.notificationService.showNotification("Please select Bank.", "INFO", "info",() => {
        this.notificationService.setNotificationVisibility(false);
        return;
      });
    }
    if (!this.amountAllocate) {
      return this.notificationService.showNotification("Please enter Amount To Allocate.", "INFO", "info",() => {
        this.notificationService.setNotificationVisibility(false);
        return;
      });
    }
  
    if (this.isNegative(this.amountAllocate)) {
      return this.notificationService.showNotification("Amount to Allocate should not be negative.", "INFO", "info",() => {
        this.notificationService.setNotificationVisibility(false);
        return;
      });
    }
    if (this.isNegative(this.allocationData.invhTotAgencyFee)) {
      return this.notificationService.showNotification("Agency Commission should not be negative.", "INFO", "info",() => {
        this.notificationService.setNotificationVisibility(false);
        return;
      });
    }
    if (this.isNegative(this.allocationData.invhTotOurfee)) {
      return this.notificationService.showNotification("Our Fee should not be negative.", "INFO", "info",() => {
        this.notificationService.setNotificationVisibility(false);
        return;
      });
    }
    if (this.isNegative(this.allocationData.invhTotSal)) {
      return this.notificationService.showNotification("Contractor Due should not be negative.", "INFO", "info",() => {
        this.notificationService.setNotificationVisibility(false);
        return;
      });
    }
    if (this.isNegative(this.allocationData.invhVATI)) {
      return this.notificationService.showNotification("VAT should not be negative.", "INFO", "info",() => {
        this.notificationService.setNotificationVisibility(false);
        return;
      });
    }
    if (this.isNegative(this.bankChargesContractor)) {
      return this.notificationService.showNotification("Bank Charges Contractor should not be negative.", "INFO", "info",() => {
        this.notificationService.setNotificationVisibility(false);
        return;
      });
    }
    if (this.isNegative(this.bankChargesAf)) {
      return this.notificationService.showNotification("Bank Charges SMTG should not be negative.", "INFO", "info",() => {
        this.notificationService.setNotificationVisibility(false);
        return;
      });
    }
    if (this.isNegative(this.taxWithHeld)) {
      return this.notificationService.showNotification("Tax Withheld should not be negative.", "INFO", "info",() => {
        this.notificationService.setNotificationVisibility(false);
        return;
      });
    }
    if (this.isNegative(this.pendingLeftDue)) {
      return this.notificationService.showNotification("Pending Left Due should not be negative.", "INFO", "info",() => {
        this.notificationService.setNotificationVisibility(false);
        return;
      });
    }
  
    if (this.factoring && this.allocationType === "INV" && this.invoice) {
      if (!this.factoring) {
        return this.notificationService.showNotification("Please select Factoring option.", "INFO", "info",() => {
          this.notificationService.setNotificationVisibility(false);
          return;
        });
      }
      
      const totalFactoringAmount =
        (parseFloat(this.amountAllocate) || 0) +
        (parseFloat(this.bankChargesContractor as any) || 0) +
        (parseFloat(this.bankChargesAf as any) || 0) +
        (parseFloat(this.taxWithHeld as any) || 0) +
        (parseFloat(this.factoring as any) || 0);
  
      if (this.hdctcIsFactoring === 1 && totalFactoringAmount === parseFloat(this.dueByAgency)) {
        return this.notificationService.showNotification(
          "You have selected 'Factoring' option but the invoice payment is a full payment of invoice. So please select 'Factoring Last' option.",
          "INFO",
          "info",() => {
            this.notificationService.setNotificationVisibility(false);
            return;
          }
        );
      }
    }
  
    if (this.pendingLeftDue < 0) {
      return this.notificationService.showNotification(
        `You are trying to allocate more than the maximum left on this invoice (${this.dueByAgency}). Allocate less or remove bank charges.`,
        "INFO",
        "info",
        () => {
          this.notificationService.setNotificationVisibility(false);
          return;
        }
      );
    }
    if (!this.validateCharges()) return;
  
    this.showAllocationSummery = true;
  
    const selectedAllocationType = this.allocationarr.find(
      allocation => allocation.altCode === this.allocationType
    );
  
    const selectedInvoice = this.invoicearr.find(inv => inv.invhCode === this.invoice);
  
    if (selectedInvoice) {
      const parts: string[] = selectedInvoice.invoiceRef.split('|').map((p: string) => p.trim());
  
      const isDuplicate = this.allocationList.some(row => row.invoiceItem === parts[0]);
  
      if (parts.length > 0) {
        this.invoiceItem = parts[0];
      } else {
        this.invoiceItem = "";
      }
  
      if (isDuplicate && this.btnText == "Add") {
        this.notificationService.showNotification(`Invoice ${parts[0]} has already been added.`, "INFO", "info",() => {
          this.notificationService.setNotificationVisibility(false);
          return;
        });
        return;
      }
    }
  
    let invhCode = "0";
    let invhCodeOtherCurrency = "0";
    let invoiceItem = "";
    let description = '';
  
    switch (this.allocationType.toUpperCase()) {
      case "INV":
        invhCode = this.invoice;
        invhCodeOtherCurrency = this.currencyDescription || "0";
        invoiceItem = this.invoiceItem;
        description = `Payment of Invoice ${this.invoiceItem}`;
        this.description = 'Payment from Agency ' + this.selectedAgencyDesc;
        break;
  
      case "ICT":
        invhCode = this.interCoCompany;
        invhCodeOtherCurrency = "0";
        invoiceItem = this.interCoCompanyarr.find(c => c.accCode === this.interCoCompany)?.accDescription || "";
        description = this.interCoBankarr.find(b => b.bkiCode === this.interCoBank)?.bkifullname || "";
        this.description = 'Payment from Agency ' + this.selectedAgencyDesc;
        break;
  
      case "ICR":
        invhCode = this.interCoCompany;
        invhCodeOtherCurrency = "0";
        invoiceItem = "";
        description = this.description;
        break;
      default:
        invhCode = "0";
        invhCodeOtherCurrency = "0";
        invoiceItem = "";
        description = this.description;
        break;
    }
  
    const newAllocation = {
      allocateType: selectedAllocationType?.altDesc || '',
      invoiceItem: invoiceItem,
      amountToAllocate: parseFloat(this.amountAllocate.toString()) || 0,
      agencyCommission: parseFloat(this.allocationData?.invhTotAgencyFee.toString()) || 0,
      ourFee: parseFloat(this.allocationData?.invhTotOurfee.toString()) ||  0,
      contractorDue: parseFloat(this.allocationData?.invhTotSal.toString()) ||  0,
      vat: parseFloat(this.allocationData?.invhVATI.toString()) || 0,
      descrp: description,
      dueByAgen: parseFloat(this.dueByAgency.toString()) || 0,
      bkCharges: parseFloat(this.bankChargesContractor.toString()) || 0,
      bkChargesSMTG: parseFloat(this.bankChargesAf.toString()) ||  0,
      taxWithheld: parseFloat(this.taxWithHeld.toString()) || 0,
      factoring: parseFloat(this.factoring.toString()) || 0,
      pendingLeft: parseFloat(this.pendingLeftDue.toString()) || 0,
      invhCode: invhCode,
      invhCodeOtherCurrency: invhCodeOtherCurrency
    };
  
    if (this.btnText === "Add") {
      this.allocationList.push(newAllocation);
    } else {
      this.allocationList[this.editIndex] = newAllocation;
      this.btnText = "Add";
      this.editIndex = -1;
    }
  
    this.calculateTotals();
    this.resetAllocation();
  }
  

  onAllocationChange() {
    // this.btnText = "Add";
    // this.editIndex = -1;

    this.invoice = null;
    this.amountAllocate = '';
    this.allocationData = {
      invhTotAgencyFee: 0,
      invhTotOurfee: 0,
      invhTotSal: 0,
      invhVATI: 0,
    };

    this.dueByAgency = '';
    this.bankChargesContractor = 0;
    this.factoring = 0;
    this.bankChargesAf = 0;
    this.taxWithHeld = 0;
    this.pendingLeftDue = 0;
      
    if (this.allocationType === 'ACC') {
      this.disabledFields['invoice'] = true;
      this.disabledFields['invhTotAgencyFee'] = true;
      this.disabledFields['invhTotSal'] = true;
      this.disabledFields['invhTotOurfee'] = true;
      this.disabledFields['currencyDescription'] = true;
      this.disabledFields['bankChargesContractor'] = true;
      this.disabledFields['bankChargesAf'] = true;
      this.disabledFields['taxWithHeld'] = true;
      this.disabledFields['factoring'] = true;
      this.isInterCoVisible = false;
      this.isinterCoBankVisible = false;
      this.isItemVisible = true;
      this.invoice = null;     
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
      this.disabledFields['bankChargesContractor'] = false;
      this.disabledFields['bankChargesAf'] = false;
      this.disabledFields['taxWithHeld'] = false;
      this.disabledFields['factoring'] = false;
      this.description = 'Payment from Agency ' + this.selectedAgencyDesc;

      return;
    }

    if (this.allocationType === 'ICT') {
      this.disabledFields['currencyDescription'] = true;
      this.disabledFields['invoice'] = false;
      this.isInterCoVisible = true;
      this.isItemVisible = false;
      this.amountAllocate = "";
      this.disabledFields['bankChargesContractor'] = true;
      this.disabledFields['bankChargesAf'] = true;
      this.disabledFields['taxWithHeld'] = true;
      this.disabledFields['factoring'] = true;
      this.description = 'Payment on InterCo Company from ' + this.selectedAgencyDesc;

      return;
    }

    this.isFieldReadOnly = this.allocationType === "123";
  }

  validateCharges(): boolean {
    if (this.allocationType == "INV") {
      const allocatedAmt = parseFloat(this.amountAllocate.toString()) || 0;
      const dueByAmt = parseFloat(this.dueByAgency.toString()) || 0;
      const contractorCharges = parseFloat(this.bankChargesContractor.toString()) || 0;
      const afCharges = parseFloat(this.bankChargesAf.toString()) || 0;
      const withheldTax = parseFloat(this.taxWithHeld.toString()) || 0;
      const factoringAmt = parseFloat(this.factoring.toString()) || 0;
      const agencyCommission = parseFloat(this.allocationData.invhTotAgencyFee.toString()) || 0;
      const ourFee = parseFloat(this.allocationData.invhTotOurfee.toString()) || 0;
      const contractorDue = parseFloat(this.allocationData.invhTotSal.toString()) || 0;
      const VAT = parseFloat(this.allocationData.invhVATI.toString()) || 0;
      const pendingLeftDue = parseFloat(this.pendingLeftDue.toString()) || 0;
      if (this.invoice !== "0") {
        if (this.roundVal(allocatedAmt) > this.roundVal(dueByAmt)) {
          this.popupComponent.openPopup(
            'Confirmation',
            `You are trying to allocate more than the maximum left on this invoice (${dueByAmt}). Allocate less or remove bank charges.`,
            'Confirmation',
            () => {}
          );
          return false;
        }
      
        const totalAllocation = this.roundVal(allocatedAmt + contractorCharges + afCharges + withheldTax + factoringAmt);
        if (totalAllocation > this.roundVal(dueByAmt)) {
          this.popupComponent.openPopup(
            'Confirmation',
            `You are trying to allocate more than the maximum left on this invoice (${dueByAmt}). Allocate less or remove bank charges.`,
            'Confirmation',
            () => {}
          );
          return false;
        }
      
        if (
          this.hdctcIs3Tier &&
          this.roundVal(dueByAmt - pendingLeftDue) !== this.roundVal(agencyCommission + ourFee + contractorDue + VAT)
        ) {
          this.popupComponent.openPopup(
            'Confirmation',
            `You are trying to allocate more or less than the maximum of 'Amount To Allocate' ${this.roundVal(dueByAmt) - this.roundVal(pendingLeftDue)
            } on this invoice into 'Agency Commission' + 'Our Fee' + 'Contractor Due' + 'VAT' total amount ${agencyCommission + ourFee + contractorDue + VAT}.`,
            'Confirmation',
            () => {}
          );
          return false;
        } else if (
          !this.hdctcIs3Tier &&
          this.roundVal(dueByAmt - pendingLeftDue) < this.roundVal(agencyCommission + ourFee + contractorDue + VAT)
        ) {
          this.popupComponent.openPopup(
            'Confirmation',
            `You are trying to allocate more than the maximum of 'Amount To Allocate' ${this.roundVal(dueByAmt) - this.roundVal(pendingLeftDue)
            } on this invoice into 'Agency Commission' + 'Our Fee' + 'Contractor Due' + 'VAT' total amount ${agencyCommission + ourFee + contractorDue + VAT}.`,
            'Confirmation',
            () => {}
          );
          return false;
        }
      }
      
    }

    return true;
  }

  validateAFVChange(obj: any, id: string) {
      const allocatedAmt = parseFloat(this.amountAllocate) || 0;
      const dueByAmt = parseFloat(this.dueByAgency) || 0;
  
      const contractorCharges = parseFloat(this.bankChargesContractor as any) || 0;
      const afCharges = parseFloat(this.bankChargesAf as any) || 0;
      const withheldTax = parseFloat(this.taxWithHeld as any) || 0;
      const factoringAmt = parseFloat(this.factoring as any) || 0;
  
      if (this.invoice !== "0") {
        if (this.roundVal(allocatedAmt) > this.roundVal(dueByAmt)) {
          this.notificationService.showNotification(
            `You are trying to allocate more than the maximum left on this invoice (${dueByAmt}). Allocate less or remove bank charges.`,
            'ERROR',  // Title
            'error',() => {
              this.notificationService.setNotificationVisibility(false);
              return;
            }  // Callback function (if any action is needed)
          );
          return false;
        }
        
  
        const maxAllowedAmt = this.roundVal(parseFloat((document.getElementById(id) as HTMLInputElement)?.value || "0"));
  
        const enteredAmt = this.roundVal(parseFloat(obj?.value || "0"));
  
        if (enteredAmt > maxAllowedAmt) {
          this.popupComponent.openPopup(
            'Confirmation',
            `Entered amount ${enteredAmt} is not allowed. You can allocate a maximum amount of ${maxAllowedAmt}.`,
            'Confirmation',
            () => {
              obj.value = maxAllowedAmt;
              obj.focus();
              obj.select();
            }
          );
          return false;
        }
        
      }
    return true;
  }


  ValidateBankChargesAF(field: string) {
      const allocatedAmt = isNaN(parseFloat(this.amountAllocate)) ? 0 : parseFloat(this.amountAllocate);
      const dueByAmt = isNaN(parseFloat(this.dueByAgency)) ? 0 : parseFloat(this.dueByAgency);
  
      const contractorCharges = isNaN(parseFloat(this.bankChargesContractor as any)) ? 0 : parseFloat(this.bankChargesContractor as any);
      const afCharges = isNaN(parseFloat(this.bankChargesAf as any)) ? 0 : parseFloat(this.bankChargesAf as any);
      const withheldTax = isNaN(parseFloat(this.taxWithHeld as any)) ? 0 : parseFloat(this.taxWithHeld as any);
      const factoringAmt = isNaN(parseFloat(this.factoring as any)) ? 0 : parseFloat(this.factoring as any);
  
      if (this.invoice !== "0") {
        console.log("Checking allocation");
        this.isConfPopupOpen = true;
      
        if (this.roundVal(allocatedAmt) > this.roundVal(dueByAmt)) {
          this.popupComponent.openPopup(
            'Confirmation',
            `You are trying to allocate more than the maximum left on this invoice (${dueByAmt}). Allocate less or remove bank charges.`,
            'Confirmation',
            () => {this.isConfPopupOpen = false;}
          );
          return false;
        }
      
        const totalAllocation = this.roundVal(allocatedAmt + contractorCharges + afCharges + withheldTax + factoringAmt);
      
        if (totalAllocation > this.roundVal(dueByAmt)) {

          this.popupComponent.openPopup(
            'Confirmation',
            `You are trying to allocate more than the maximum left on this invoice (${dueByAmt}). Allocate less or remove bank charges.`,
            'Confirmation',
            () => {
              this.isConfPopupOpen = false;
              if (field == "bankChargesAf") {
                this.bankChargesAf = 0;
              }
              if (field == "taxWithHeld") {
                this.taxWithHeld = 0;
              }
              if (field == "bankChargesContractor") {
                this.bankChargesContractor = 0;
              }
              if (field == "factoring") {
                this.factoring = 0;
              }
            }
          );
          return false;
        } else {
          this.isConfPopupOpen = false;
          this.pendingLeftDue = this.roundVal(dueByAmt - contractorCharges - afCharges - allocatedAmt - withheldTax - factoringAmt);
        }
      
        if (typeof this.getSplitAmount === "function") {
          this.getSplitAmount();
        }
      }
      
    
    return true;
  }

  validateBankCharges(field: string): boolean {
    
    if (this.allocationType === 'INV' && this.isConfPopupOpen == false) {
      switch (field) {
        case 'amountAllocate':
          if (!this.amountAllocate || this.amountAllocate < '0') {
            this.notificationService.showNotification(
              'Amount to allocate should not be negative.',
              'INFO',
              'info',
              () => {
                this.amountAllocate = "0";
                this.notificationService.setNotificationVisibility(false);
              }
            );
            return false;
          }
          

          const allocatedAmt = parseFloat(this.amountAllocate) || 0;
          const dueByAmt = parseFloat(this.dueByAgency) || 0;

          const contractorCharges = parseFloat(this.bankChargesContractor as any) || 0;
          const afCharges = parseFloat(this.bankChargesAf as any) || 0;
          const withheldTax = parseFloat(this.taxWithHeld as any) || 0;
          const factoringAmt = parseFloat(this.factoring as any) || 0;
          const aldConBanks = 1

          if (this.invoiceItem !== "0") {
            if (this.roundVal(allocatedAmt) > this.roundVal(dueByAmt)) {
              this.popupComponent.openPopup(
                'Confirmation',
                `You are trying to allocate more than the maximum left on this invoice (${dueByAmt}). Allocate less or remove bank charges.`,
                'confirmation',
                () => {}
              );
              return false;
            }
          
            const totalAllocated = this.roundVal(
              allocatedAmt + contractorCharges + afCharges + withheldTax + factoringAmt
            );
          
            if (totalAllocated !== this.roundVal(dueByAmt)) {
              const difference = this.roundVal(dueByAmt - allocatedAmt - withheldTax - factoringAmt);
          
              this.popupComponent.openPopup(
                'Confirmation',
                `The amount entered: ${totalAllocated} is not equal to the pending amount: ${dueByAmt}. 
                Will the difference: ${difference} be considered as bank charges? 
                Click 'Confirm' if invoice is 100% paid, or 'Cancel' if future payments are expected.`,
                'confirmation',
                () => {
                  if (aldConBanks !== 1) {
                    this.pendingLeftDue = 0;
                    this.bankChargesAf = this.roundVal(dueByAmt - contractorCharges - allocatedAmt - withheldTax - factoringAmt);
                  } else {
                    this.bankChargesContractor = this.roundVal(dueByAmt - afCharges - allocatedAmt - withheldTax - factoringAmt);
                    this.pendingLeftDue = 0;
                  }
                },
                () => {
                  if (totalAllocated > this.roundVal(dueByAmt)) {
                    this.popupComponent.openPopup(
                      'Confirmation',
                      `You are trying to allocate more than the maximum left on this invoice (${dueByAmt}). Allocate less or remove bank charges.`,
                      'confirmation',
                      () => {}
                    );
                  } else {
                    this.pendingLeftDue = this.roundVal(dueByAmt - contractorCharges - afCharges - allocatedAmt - withheldTax - factoringAmt);
                  }
                }
              );
          
              this.getSplitAmount();
              return false;
            }
          }
          

          break;

          
            case 'taxWithHeld':
              if (!this.taxWithHeld) {
                this.taxWithHeld = 0;
              } else if (this.taxWithHeld < 0.0) {
                this.notificationService.showNotification(
                  'Tax withheld should not be negative.',
                  'INFO',
                  'info',
                  () => {
                    this.notificationService.setNotificationVisibility(false);
                    return;
                  }
                );
                this.taxWithHeld = 0;
                return false;
              }
              this.ValidateBankChargesAF(field);
              break;
          
            case 'bankChargesAf':
              if (!this.bankChargesAf) {
                this.bankChargesAf = 0;
              } else if (this.bankChargesAf < 0) {
                this.notificationService.showNotification(
                  'Bank Charges SMTG should not be negative.',
                  'INFO',
                  'info',
                  () => {
                    this.notificationService.setNotificationVisibility(false);
                    return;
                  }
                );
                this.bankChargesAf = 0;
                return false;
              }
              this.ValidateBankChargesAF(field);
              break;
          
            case 'bankChargesContractor':
              if (!this.bankChargesContractor) {
                this.bankChargesContractor = 0;
              } else if (this.bankChargesContractor < 0) {
                this.notificationService.showNotification(
                  'Bank Charges Contractor should not be negative.',
                  'INFO',
                  'info',
                  () => {
                    this.notificationService.setNotificationVisibility(false);
                    return;
                  }
                );
                this.bankChargesContractor = 0;
                return false;
              }
              this.ValidateBankChargesAF(field);
              break;
          
            case 'factoring':
              if (!this.factoring) {
                this.factoring = 0;
              } else if (this.factoring < 0) {
                this.notificationService.showNotification(
                  'Factoring should not be negative.',
                  'INFO',
                  'info',
                  () => {
                    this.notificationService.setNotificationVisibility(false);
                    return;
                  }
                );
                this.factoring = 0;
                return false;
              }
              this.ValidateBankChargesAF(field);
              break;
          
            case 'allocationData.invhTotAgencyFee':
              let invhTotAgencyFee = parseFloat(this.allocationData.invhVATI) || 0;
          
              if (invhTotAgencyFee < 0) {
                this.notificationService.showNotification(
                  'invhTotAgencyFee should not be negative.',
                  'INFO',
                  'info',
                  () => {
                    this.notificationService.setNotificationVisibility(false);
                    return;
                  }
                );
                this.allocationData.invhTotAgencyFee = 0;
                return false;
              }
          
              this.validateAFVChange(this.allocationData, 'invhTotAgencyFee');
              break;
          
            case 'allocationData.invhVATI':
              let invhVATI = parseFloat(this.allocationData.invhVATI) || 0;
          
              if (invhVATI < 0) {
                this.notificationService.showNotification(
                  'allocationData.invhVATI should not be negative.',
                  'INFO',
                  'info',
                  () => {
                    this.notificationService.setNotificationVisibility(false);
                    return;
                  }
                );
                this.allocationData.invhVATI = 0;
                return false;
              }
          
              this.validateAFVChange(this.allocationData, 'invhVATI');
              break;
          
            case 'allocationData.invhTotOurfee':
              if (!this.allocationData.invhTotOurfee) {
                this.allocationData.invhTotOurfee = 0;
              } else if (this.allocationData.invhTotOurfee < 0) {
                this.notificationService.showNotification(
                  'allocationData invhTotOurfee should not be negative.',
                  'INFO',
                  'info',
                  () => {
                    this.notificationService.setNotificationVisibility(false);
                    return;
                  }
                );
                this.allocationData.invhTotOurfee = 0;
                return false;
              }
              this.validateAFVChange(this.allocationData, 'invhTotOurfee');
              break;
          
            case 'allocationData.invhTotSal':
              if (!this.allocationData.invhTotSal) {
                this.allocationData.invhTotSal = 0;
              } else if (this.allocationData.invhTotSal < 0) {
                this.notificationService.showNotification(
                  'allocationData invhTotSal should not be negative.',
                  'INFO',
                  'info',
                  () => {
                    this.notificationService.setNotificationVisibility(false);
                    return;
                  }
                );
                this.allocationData.invhTotSal = 0;
                return false;
              }
              this.validateAFVChange(this.allocationData, 'invhTotSal');
              break;
          
            case 'pendingLeftDue':
              if (!this.pendingLeftDue) {
                this.pendingLeftDue = 0;
              } else if (this.pendingLeftDue < 0) {
                this.notificationService.showNotification(
                  'Pending Left Due should not be negative.',
                  'INFO',
                  'info',
                  () => {
                    this.notificationService.setNotificationVisibility(false);
                    return;
                  }
                );
                this.pendingLeftDue = 0;
                return false;
              }
              break;
          
          


        default:
          console.log("Invalid field");
          return false;
      }
    }
    return true;
  }

  roundVal(value: number): number {
    return Math.round(value * 100) / 100;
  }

  getSplitAmount(): void {
    console.log('Split amount calculation triggered');
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
          this.interCoBank = null; 
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
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

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
    this.showAllocation = false;
    this.showAllocationSummery = false;
    this.resetAllocation();
    this.allocationList = [];
    this.calculateTotals();
    this.invoiceDropdown = null;
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
    this.notificationService.setNotificationVisibility(true);
    this.popupComponent.openPopup(
      'Confirmation',
      'Are you sure that you want to Delete?',
      'Confirmation',
      () => {
        this.allocationList.splice(index, 1);
        this.calculateTotals();
        this.notificationService.setNotificationVisibility(false);
        this.resetAllocation();
          this.notificationService.showNotification(
          'Record has been deleted successfully.',
          'SUCCESS',
          'success',
          () => {
            this.notificationService.setNotificationVisibility(false);
          }
        );
      }
    );
  }

  updateRow(row: any, index: number) {
    this.btnText = "Update";
    this.editIndex = index;

    const selectedAllocationType = this.allocationarr.find(
      allocation => allocation.altDesc === row.allocateType
    );

    const selectedInvoice = this.invoicearr.find(inv => inv.invoiceRef.includes(row.invoiceItem));

    let invoiceCode = "";
    if (selectedInvoice) {
      const parts: string[] = selectedInvoice.invoiceRef.split('|').map((p: string) => p.trim());
      invoiceCode = parts.length > 0 ? selectedInvoice.invhCode : "";    
      this.isInterCoVisible = false;
      this.isinterCoBankVisible = false;
      this.isItemVisible = true;
    }

    const selectedinterCoCompanyarr = this.interCoCompanyarr.find(c => c.accDescription.includes(row.invoiceItem));

    let CoCompanyCode = "";
    if (selectedinterCoCompanyarr) {
      const parts: string[] = selectedinterCoCompanyarr.accDescription.split('|').map((p: string) => p.trim());
      CoCompanyCode = parts.length > 0 ? selectedinterCoCompanyarr.accCode : "";      
      this.isInterCoVisible = true;
      this.isinterCoBankVisible = true;
      this.isItemVisible = false;
    }

    const selectedinterCoBankarr = this.interCoBankarr.find(c => c.bkifullname.includes(row.descrp));

    let CoBankCode = "";
    if (selectedinterCoBankarr) {
      const parts: string[] = selectedinterCoBankarr.bkifullname.split('|').map((p: string) => p.trim());
      CoBankCode = parts.length > 0 ? selectedinterCoBankarr.bkiCode : "";
      this.isInterCoVisible = true;
      this.isinterCoBankVisible = true;
      this.isItemVisible = false;
    }

    this.allocationType = selectedAllocationType?.altCode || "";
    this.invoice = invoiceCode;
    this.interCoCompany = CoCompanyCode;
    this.interCoBank = CoBankCode;
    this.amountAllocate = row.amountToAllocate;
    this.allocationData = {
      invhTotAgencyFee: row.agencyCommission,
      invhTotOurfee: row.ourFee,
      invhTotSal: row.contractorDue,
      invhVATI: row.vat
    };
    this.description = row.descrp || "";
    this.dueByAgency = row.dueByAgen || 0;
    this.bankChargesContractor = row.bkCharges || 0;
    this.bankChargesAf = row.bkChargesSMTG || 0;
    this.taxWithHeld = row.taxWithheld || 0;
    this.factoring = row.factoring || 0;
    this.pendingLeftDue = row.pendingLeft || 0;
    this.currencyDescription = row.invhCodeOtherCurrency || "null";
    this.notificationService.setNotificationVisibility(false);

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
    // this.allocationData = {
    //   invhTotAgencyFee: 0,
    //   invhTotOurfee: 0,
    //   invhTotSal: 0,
    //   invhVATI: 0,
    // };

    this.dueByAgency = '';
    this.bankChargesContractor = 0;
    this.factoring = 0;
    this.bankChargesAf = 0;
    this.taxWithHeld = 0;
    this.pendingLeftDue = 0;
    this.currencyDescription = null;
    this.interCoCompany = null;
    this.interCoBank = null;
    this.btnText = "Add";
    this.editIndex = -1;
    this.isInterCoVisible = false;
    this.isinterCoBankVisible = false;
    this.isItemVisible = true;
  }

  confirmAllocation(): void {
    const totalAmount = parseFloat(this.txtTotalAmount) || 0;
    const allocatedConfirmedAmount = this.txtAllocatedConfirmedAmount || 0;
    const amountAvailable = this.txtAmountAvailable || 0;
  
    this.popupComponent.openPopup(
      'Confirmation',
      'The accounting scheme will be created. Select Yes to update, No to edit your allocation lines',
      'Confirmation',
      () => {
        if (totalAmount !== 0.00 && allocatedConfirmedAmount === amountAvailable) {
          this.notificationService.showNotification(
            'The total allocated is different from the amount received. This update cannot be accepted.',
            'INFO',
            'info',
            () => {
              this.notificationService.setNotificationVisibility(false);
              this.btnSubmitAllocVisible = true;
            }
          );
        } else {
          this.btnSubmitAllocVisible = false;
          this.submitAllocation();
        }
      },
      () => {
        this.btnSubmitAllocVisible = true;
      }
    );
  }
  
  submitAllocation(): void {
    const totalAmount = parseFloat(this.txtTotalAmount) || 0;
    const allocatedConfirmedAmount = this.txtAllocatedConfirmedAmount || 0;
    const amountAvailable = this.txtAmountAvailable || 0;
  
    if (amountAvailable == allocatedConfirmedAmount && totalAmount == 0) {
      let strContDue = '';
      let contDueCount = 1;
      let strFactoringCheck = '';
      let FactoringCheckCount = 1;
      let strDueAgeOur = '';
      let contDueAgeOurCount = 1;


      for (let i = 0; i < this.allocationList.length; i++) {
        const row = this.allocationList[i];

        const selectedAllocationType = this.allocationarr.find(
          allocation => allocation.altDesc === row.allocateType
        );

        const newItem = {
          AutoID: i+1,
          ALDCode: 0,
          AllocationCode: selectedAllocationType?.altCode || "",
          AllocationType: row.allocateType || '',
          InvhCode: row.invhCode != null ? row.invhCode.toString() : '',
          InvhCodeOtherCurrency: row.invhCodeOtherCurrency || '',
          InvoiceItem: row.invoiceItem || '',
          AmountToAllocate:  parseFloat(row.amountToAllocate) || 0,
          AgencyCommission:  parseFloat(row.agencyCommission) || 0,
          OurFee:  parseFloat(row.ourFee) || 0,
          ContractorDue:  parseFloat(row.contractorDue) || 0,
          VAT:  parseFloat(row.vat) || 0,
          Description: row.descrp || '',
          DueByAgency:  parseFloat(row.dueByAgen) || 0,
          BCContractor:  parseFloat(row.bkCharges) || 0,
          BCSMTG:  parseFloat(row.bkChargesSMTG) || 0,
          TaxWithHeld:  parseFloat(row.taxWithheld) || 0,
          Factoring:  parseFloat(row.factoring) || 0,
          PendingLeftDue:  parseFloat(row.pendingLeft) || 0
        };
      
        this.allocateToInvoiceList.push(newItem);

        if (
          this.allocationData.ctcIs3Tier == '1' && row.AllocationCode == 'INV' && Number(row.agencyCommission) <= 0 && Number(row.ourFee) <= 0 && Number(row.contractorDue) <= 0
        ) {
          strDueAgeOur += `${contDueAgeOurCount}. Invoice : ${row.InvoiceItem}\n`;
          contDueAgeOurCount++;
        } else if (
          this.allocationData.ctcIs3Tier == '1' && row.allocationCode == 'INV' && this.hdFlag == '0' && Number(row.contractorDue) <= 0
        ) {
          strContDue += `${contDueCount}. Invoice : ${row.InvoiceItem}\n`;
          contDueCount++;
        }

        if (row.AllocationCode == 'INV') {
          // const factoringFlag = this.factoringMap?.[row.InvhCode];

          // const htValue = ht[row.invhCode]?.toString() || '';
          // const parts = htValue.split('@');

          // if (row.ALDCode == '0' && factoringFlag === '1') {
          //   strFactoringCheck += `${FactoringCheckCount}. Invoice : ${row.InvoiceItem}\n`;
          //   FactoringCheckCount++;
          // }
        }

        
      }

      if (strDueAgeOur) {
        alert(
          'Agency Fee, Our Fee and Contractor Due amount do not exist in the following Invoice(s):\n' +
          strDueAgeOur +
          '\nYou cannot allocate the above invoice(s).'
        );
        return;
      } else if (strFactoringCheck) {
        alert(
          'Factoring options are not selected for the following Invoice(s):\n' +
          strFactoringCheck +
          '\nPlease update the above invoice(s) manually by selecting proper factoring option.'
        );
        return;
      } else if (strContDue && this.hdFlag == '0') {
        const message ='Contractor Due Amount does not exist in the following Invoice(s):\n' +
              strContDue +
              '\nPlease select OK if you want to proceed without Contractor’s DUE amount or SALARY.';
            const contractorConfirm = confirm(message);
            if (contractorConfirm) {
              this.hdFlag = '1';
              this.submitAllocation();
            } else {
              return;
            }
      } else{
        let Response = this.SaveAllocationToInvoice(this.cieCode, this.selectedAgency, this.currency, this.bankCode, this.bkAccount, this.txtAmountAvailable
          ,this.debitAmount, this.mvtKey,  this.mvtID, this.mvtDate, this.selectedAgencyDesc, this.refRem, this.userName, this.allocateToInvoiceList
        );
    }
    } else {
      this.notificationService.showNotification(
        'The total allocated is different from the amount received. This update cannot be accepted.',
        'INFO',
        'info',
        () => {
          this.notificationService.setNotificationVisibility(false);
          this.btnSubmitAllocVisible = true;
        }
      );
    }
    
  }

  SaveAllocationToInvoice(
    cieCode: number,
    agencyCode: number,
    currency: string,
    cieBankCode: number,
    bankAccount: string,
    creditAmount: number,
    debitAmount: number,
    mvtKey: number,
    mvtID: number,
    mvtDate: string,
    agencyName: string,
    paymentRef: string,
    loggedInUser: string,
    allocationList: any[]
  ): void {
    const formData = {
      CieCode: cieCode,
      AgencyCode: agencyCode,
      BkiCurrency: currency,
      CieBankCode: cieBankCode,
      BkiAccountNb: bankAccount,
      CreditAmount: creditAmount,
      DebitAmount: debitAmount,
      MvtKey: mvtKey,
      MvtID: mvtID,
      MvtDate: mvtDate,
      AgencyName: agencyName,
      AlaAgnPayRef: paymentRef,
      LoggedInUser: loggedInUser,
      AllocateToInvoiceType: allocationList
    };
  
    console.log('Submitted Data:', formData);
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
  
    const apiUrl = environment.API_BASE_URL + 'OCRAI/SaveAllocationToInvoice';
    this.http.post<any>(apiUrl, formData, { headers }).subscribe({

      next: (response) => {
        console.log('API Response:', response);
  
        const result = response?.data?.result;

      if (result && result.length > 0) {
        this.notificationService.showNotification(
          `${result}`,
          'INFO',
          'info',
          () => {
            this.notificationService.setNotificationVisibility(false);
            return;
          }
        );
      } else {
        this.notificationService.showNotification(
          `${result}`,
          'INFO',
          'info',
          () => {
            this.notificationService.setNotificationVisibility(false);
            return;
          }
        );
      }
      },
      error: (error) => {
        console.error('API Error:', error);
        this.notificationService.showNotification(
          'An error occurred. Please try again.',
          'ERROR',
          'error',
          () => {
            this.dialogRef.close();
            this.notificationService.setNotificationVisibility(false);
          }
        );
      }
    });
  }
  
}
