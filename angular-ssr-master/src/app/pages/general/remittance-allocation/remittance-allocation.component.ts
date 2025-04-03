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
import { ConfirmationPopComponent } from '../confirmation-pop/confirmation-pop.component';

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
  hdctcIs3Tier: string = '0';
  hdctcIsFactoring: string = '0';
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
  hdnAmountAvailable : number = 0;
  hdnTotalAmount: string = '0';
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
    this.hdnAmountAvailable = this.txtAmountAvailable;
    this.hdnTotalAmount = this.txtTotalAmount;

    this.disabledFields = {
      invoice: false,
      invhTotAgencyFee: true,
      invhTotOurfee: true,
      invhTotSal: true,
      invhVATI: true,
      dueByAgency: true,
      pendingLeftDue: true,
      currencyDescription: false,
      btnAddRow: false
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
    this.getAllocationType();
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
    this.getAllocationType();
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

    this.toggleAllocation()
    debugger
    if (this.allocationData.ctcIs3Tier == 0) {
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
            alert("Invoice " + invoiceItem + " has already been added.");
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

    if (!this.allocationType) return alert("Please select Allocation Type.");
    if (this.allocationType === "INV" && !this.invoice) return alert("Please select an Item.");
    if (this.allocationType === "ICT" && !this.interCoCompany) return alert("Please select InterCo Account.");
    if (this.allocationType === "ICT" && !this.interCoBank) return alert("Please select Bank.");
    if (!this.amountAllocate) return alert("Please enter Amount To Allocate.");

    if (this.isNegative(this.amountAllocate)) return alert("Amount to Allocate should not be negative.");
    if (this.isNegative(this.allocationData.invhTotAgencyFee)) return alert("Agency Commission should not be negative.");
    if (this.isNegative(this.allocationData.invhTotOurfee)) return alert("Our Fee should not be negative.");
    if (this.isNegative(this.allocationData.invhTotSal)) return alert("Contractor Due should not be negative.");
    if (this.isNegative(this.allocationData.invhVATI)) return alert("VAT should not be negative.");
    if (this.isNegative(this.bankChargesContractor)) return alert("Bank Charges Contractor should not be negative.");
    if (this.isNegative(this.bankChargesAf)) return alert("Bank Charges SMTG should not be negative.");
    if (this.isNegative(this.taxWithHeld)) return alert("Tax Withheld should not be negative.");
    if (this.isNegative(this.pendingLeftDue)) return alert("Pending Left Due should not be negative.");

    if (this.factoring && this.allocationType === "INV" && this.invoice) {
      if (!this.factoring) return alert("Please select Factoring option.");
      const totalFactoringAmount =
        parseFloat(this.amountAllocate) || 0 +
        parseFloat(this.bankChargesContractor as any) || 0 +
        parseFloat(this.bankChargesAf as any) || 0 +
        parseFloat(this.taxWithHeld as any) || 0 +
        parseFloat(this.factoring as any) || 0;

      if (this.hdctcIsFactoring === "1" && totalFactoringAmount === parseFloat(this.dueByAgency)) {
        return alert("You have selected 'Factoring' option but the invoice payment is a full payment of invoice. So please select 'Factoring Last' option.");
      }
    }

    if (this.pendingLeftDue < 0) {
      return alert(`You are trying to allocate more than the maximum left on this invoice (${this.dueByAgency}). Allocate less or remove bank charges.`);
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
        alert("Invoice " + parts[0] + " has already been added.");
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
        this.invoiceItem = this.interCoCompanyarr.find(c => c.accCode === this.interCoCompany)?.accDescription || "";
        this.description = this.interCoBankarr.find(b => b.bkiCode === this.interCoBank)?.bkifullname || "";
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
        this.invoiceItem = "";
        this.description = this.description;
        break;
    }


    const newAllocation = {
      allocateType: selectedAllocationType?.altDesc || '',
      invoiceItem: invoiceItem,
      amountToAllocate: this.amountAllocate || 0,
      agencyCommission: this.allocationData?.invhTotAgencyFee || 0,
      ourFee: this.allocationData?.invhTotOurfee || 0,
      contractorDue: this.allocationData?.invhTotSal || 0,
      vat: this.allocationData?.invhVATI || 0,
      descrp: description,
      dueByAgen: this.dueByAgency || 0,
      bkCharges: this.bankChargesContractor || 0,
      bkChargesSMTG: this.bankChargesAf || 0,
      taxWithheld: this.taxWithHeld || 0,
      factoring: this.factoring || 0,
      pendingLeft: this.pendingLeftDue || 0,
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

  validateCharges(): boolean {
    if (this.allocateType == "INV") {
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
          alert(`You are trying to allocate more than the maximum left on this invoice (${dueByAmt}). Allocate less or remove bank charges.`);
          return false;
        }
        const totalAllocation = this.roundVal(allocatedAmt + contractorCharges + afCharges + withheldTax + factoringAmt);
        if (totalAllocation > this.roundVal(dueByAmt)) {
          alert(`You are trying to allocate more than the maximum left on this invoice (${dueByAmt}). Allocate less or remove bank charges.`);
          return false;
        }
        if (
          this.hdctcIs3Tier &&
          this.roundVal(dueByAmt - pendingLeftDue) !== this.roundVal(agencyCommission + ourFee + contractorDue + VAT)
        ) {
          alert(
            `You are trying to allocate more or less than the maximum of 'Amount To Allocate' ${this.roundVal(dueByAmt) - this.roundVal(pendingLeftDue)
            } on this invoice into 'Agency Commission' + 'Our Fee' + 'Contractor Due' + 'VAT' total amount ${agencyCommission + ourFee + contractorDue + VAT
            }.`
          );
          return false;
        } else if (
          !this.hdctcIs3Tier &&
          this.roundVal(dueByAmt - pendingLeftDue) < this.roundVal(agencyCommission + ourFee + contractorDue + VAT)
        ) {
          alert(
            `You are trying to allocate more than the maximum of 'Amount To Allocate' ${this.roundVal(dueByAmt) - this.roundVal(pendingLeftDue)
            } on this invoice into 'Agency Commission' + 'Our Fee' + 'Contractor Due' + 'VAT' total amount ${agencyCommission + ourFee + contractorDue + VAT
            }.`
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
          alert(`You are trying to allocate more than the maximum left on this invoice (${dueByAmt}). Allocate less or remove bank charges.`);
          return false;
        }
  
        const maxAllowedAmt = this.roundVal(parseFloat((document.getElementById(id) as HTMLInputElement)?.value || "0"));
  
        const enteredAmt = this.roundVal(parseFloat(obj?.value || "0"));
  
        if (enteredAmt > maxAllowedAmt) {
          alert(`Entered amount ${enteredAmt} is not allowed. You can allocate a maximum amount of ${maxAllowedAmt}.`);
          obj.value = maxAllowedAmt;
          obj.focus();
          obj.select();
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
  
        if (this.roundVal(allocatedAmt) > this.roundVal(dueByAmt)) {
          alert(`You are trying to allocate more than the maximum left on this invoice (${dueByAmt}). Allocate less or remove bank charges.`);
          return false;
        }
  
        const totalAllocation = this.roundVal(allocatedAmt + contractorCharges + afCharges + withheldTax + factoringAmt);
  
        if (totalAllocation > this.roundVal(dueByAmt)) {
          alert(`You are trying to allocate more than the maximum left on this invoice (${dueByAmt}). Allocate less or remove bank charges.`);
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
  
          return false;
        } else {
          this.pendingLeftDue = this.roundVal(dueByAmt - contractorCharges - afCharges - allocatedAmt - withheldTax - factoringAmt);
        }
  
        if (typeof this.getSplitAmount === "function") {
          this.getSplitAmount();
        }
      }
    
    return true;
  }

  validateBankCharges(field: string): boolean {
    if (this.allocationType === 'INV') {
      switch (field) {
        case 'amountAllocate':
          if (!this.amountAllocate || this.amountAllocate < '0') {
            alert('Amount to allocate should not be negative.');
            this.amountAllocate = "0";
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
              alert(`You are trying to allocate more than the maximum left on this invoice (${dueByAmt}). Allocate less or remove bank charges.`);
              return false;
            }

            const totalAllocated = this.roundVal(
              allocatedAmt +
              contractorCharges +
              afCharges +
              withheldTax +
              factoringAmt
            );

            if (totalAllocated !== this.roundVal(dueByAmt)) {
              const difference = this.roundVal(dueByAmt - allocatedAmt - withheldTax - factoringAmt);

              if (confirm(`The amount entered: ${totalAllocated} is not equal to the pending amount: ${dueByAmt}.
  Will the difference: ${difference} be considered as bank charges?
  Reply 'OK' if invoice 100% paid, 'Cancel' if future payments are expected.`)) {
                if (aldConBanks !== 1) {

                  this.pendingLeftDue = 0;
                  this.bankChargesAf = this.roundVal(dueByAmt - contractorCharges - allocatedAmt - withheldTax - factoringAmt);
                } else {

                  this.bankChargesContractor = this.roundVal(dueByAmt - afCharges - allocatedAmt - withheldTax - factoringAmt);
                  this.pendingLeftDue = 0;
                }
              } else if (totalAllocated > this.roundVal(dueByAmt)) {
                alert(`You are trying to allocate more than the maximum left on this invoice (${dueByAmt}). Allocate less or remove bank charges.`);
                return false;
              } else {
                this.pendingLeftDue = this.roundVal(dueByAmt - contractorCharges - afCharges - allocatedAmt - withheldTax - factoringAmt);
              }

              this.getSplitAmount();
              return false;
            }
          }

          break;

        case 'taxWithHeld':
          if (!this.taxWithHeld) {
            this.taxWithHeld = 0;
          } else if (this.taxWithHeld < 0.0) {
            alert('Tax withheld should not be negative.');
            this.taxWithHeld = 0;
            return false;
          }
          this.ValidateBankChargesAF(field)
          break;

        case 'bankChargesAf':
          if (!this.bankChargesAf) {
            this.bankChargesAf = 0;
          } else if (this.bankChargesAf < 0) {
            alert('Bank Charges SMTG should not be negative.');
            this.bankChargesAf = 0;
            return false;
          }
          this.ValidateBankChargesAF(field)
          break;


        case 'bankChargesContractor':
          if (!this.bankChargesContractor) {
            this.bankChargesContractor = 0;
          } else if (this.bankChargesContractor < 0) {
            alert('Bank Charges Contractor should not be negative.');
            this.bankChargesContractor = 0;
            return false;
          }
          this.ValidateBankChargesAF(field)
          break;

        case 'factoring':
          if (!this.factoring) {
            this.factoring = 0;
          } else if (this.factoring < 0) {
            alert('factoring should not be negative.');
            this.factoring = 0;
            return false;
          }
          this.ValidateBankChargesAF(field)
          break;

        case 'allocationData.invhTotAgencyFee':
          let invhTotAgencyFee = parseFloat(this.allocationData.invhVATI) || 0;

          if (invhTotAgencyFee < 0) {
            alert(' invhTotAgencyFee should not be negative.');
            this.allocationData.invhTotAgencyFee = 0;
            return false;
          }


          this.validateAFVChange(this.allocationData, 'invhTotAgencyFee');
          break;

        case 'allocationData.invhVATI':
          let invhVATI = parseFloat(this.allocationData.invhVATI) || 0;

          if (invhVATI < 0) {
            alert('allocationData.invhVATI should not be negative.');
            this.allocationData.invhVATI = 0;
            return false;
          }

          // Ensure you pass the correct object and ID to validateAFVChange
          this.validateAFVChange(this.allocationData, 'invhVATI');
          break;


        case 'allocationData.invhTotOurfee':
          if (!this.allocationData.invhTotOurfee) {
            this.allocationData.invhTotOurfee = 0;
          } else if (this.allocationData.invhTotOurfee < 0) {
            alert('allocationData invhTotOurfee should not be negative.');
            this.allocationData.invhTotOurfee = 0;
            return false;
          }
          this.validateAFVChange(this.allocationData, 'invhTotOurfee');
          break;

        case 'allocationData.invhTotSal':
          if (!this.allocationData.invhTotSal) {
            this.allocationData.invhTotSal = 0;
          } else if (this.allocationData.invhTotSal < 0) {
            alert('allocationData invhTotSal should not be negative.');
            this.allocationData.invhTotSal = 0;
            return false;
          }
          this.validateAFVChange(this.allocationData, 'invhTotSal');
          break;

        case 'pendingLeftDue':
          if (!this.pendingLeftDue) {
            this.pendingLeftDue = 0;
          } else if (this.pendingLeftDue < 0) {
            alert('pending Left Due should not be negative.');
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
    this.showAllocation = false;
    this.showAllocationSummery = false;
    this.resetAllocation();
    this.allocationList = [];
    this.txtAllocatedConfirmedAmount = 0;
    this.txtTotalAmount = this.hdnTotalAmount;
    this.txtAmountAvailable = this.hdnAmountAvailable;
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
      'warning',
      () => {
        this.allocationList.splice(index, 1);
        this.calculateTotals();
        this.notificationService.setNotificationVisibility(false);
  
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
    }

    this.allocationType = selectedAllocationType?.altCode || "";
    this.invoice = invoiceCode;
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
    this.currencyDescription = null;
    this.interCoCompany = null;
    this.interCoBank = null;
    this.btnText = "Add";
    this.editIndex = -1;
  }

  confirmAllocation(): boolean {
    const totalAmount = parseFloat(this.txtTotalAmount) || 0;
    const allocatedConfirmedAmount = this.txtAllocatedConfirmedAmount || 0;
    const amountAvailable = this.txtAmountAvailable || 0;

    if (confirm("The accounting scheme will be created. Select OK to update, Cancel to edit your allocation lines")) {
      if (totalAmount !== 0.00 && allocatedConfirmedAmount === amountAvailable) {
        alert("The total allocated is different from the amount received. This update cannot be accepted.");
        this.btnSubmitAllocVisible = true;
        return false;
      } else {
        this.btnSubmitAllocVisible = false;
        return true;
      }
    } else {
      this.btnSubmitAllocVisible = true;
      return false;
    }
  }

}
