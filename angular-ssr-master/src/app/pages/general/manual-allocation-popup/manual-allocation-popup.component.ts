import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../constant/api-constants';
import { NotificationPopupService } from '../notification-popup/notification-popup.service';
import { DownloadPdfService } from '../service/downlaodPdf.service';
import { SharedUtils } from '../shared/shared-utils';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-manual-allocation-popup',
  templateUrl: './manual-allocation-popup.component.html',
  styleUrls: ['./manual-allocation-popup.component.css']
})
export class ManualAllocationPopupComponent implements OnInit{

  @ViewChild('myForm') myForm: any;
  currency: string = '';
  bankPaymentDate : string = '';
  amountPaid : string = '';
  invoiceNo : string = '';
  fundSource : string = '';
  fundDescription : string = '';
  token: string = '';
  errors: any = {};
  loading: boolean = false;
  
  constructor(private dialogRef: MatDialogRef<ManualAllocationPopupComponent>,public notificationService: NotificationPopupService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
  ) {

    this.currency = this.extractCurrency(data.bankAccount);
    this.fundSource = data.company;
  }

  ngOnInit(): void {

    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.token = storedToken; 
    } else {
      console.error('Token not found in localStorage.');
     
    }
  }
  
  extractCurrency(bankAccountString: string): string {
    if (bankAccountString) {
      const parts = bankAccountString.split('|').map(part => part.trim());
      if (parts.length > 1) {
        return parts[1];
      }
    }
    return ''; 
  }


  closeDialog(): void {
    this.dialogRef.close();
  }
  
  clearform():void{
    this.bankPaymentDate=''
    this.fundDescription=''
    this.fundSource=''
    this.invoiceNo=''
    this.amountPaid=''
  }

  // submitForm(): void {
  //   if (this.myForm) {
  //     this.myForm.ngSubmit.emit();
  //   }
  // }
  clearValidation(field: string) {
    if ((this as any)[field]?.trim() !== '') {
      this.errors[field] = null;
    }
  }

  onSubmit(form: any): void {
    let isValid = true;
    this.errors = {};  // Reset errors at the start
    
    if (!this.amountPaid) {
      this.errors.amountPaid = 'Amount Paid is required.';
      isValid = false;
    }
  
    if (!this.bankPaymentDate) {
      this.errors.bankPaymentDate = 'Bank Payment Date is required.';
      isValid = false;
    }
  
    if (!this.fundDescription) {
      this.errors.fundDescription = 'Fund Description is required.';
      isValid = false;
    }
  
    if (!this.fundSource) {
      this.errors.fundSource = 'Fund Source is required.';
      isValid = false;
    }
  
    if (!this.invoiceNo) {
      this.errors.invoiceNo = 'Invoice No is required.';
      isValid = false;
    }
  
    // ✅ If form is not valid, STOP execution and show validation messages
    if (!isValid) {
      return;  // Stop execution, so API is NOT called
    }
  
    // ✅ If validation passes, call API
    this.OnAdd();
  }
  
  
  OnAdd() {
    this.loading = true;
    const errors: any = {};
    this.errors = errors;
  
    const formData = {
      bankPaymentDate: this.bankPaymentDate,
      currency: this.currency,
      amountPaid: this.amountPaid,
      invoiceNo: this.invoiceNo,
      fundSource: this.fundSource,
      fundDescription: this.fundDescription
    };
    console.log('Submitted Data:', formData);
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
  
    const apiUrl = environment.API_BASE_URL + 'OCRAI/AddManualBankAllocation';
    // const apiUrl = ''
  
    this.http.post<any>(apiUrl, formData, { headers }).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        this.loading = false;
        const resultObj = response?.data?.resultTable?.[0];
        const isSuccess = resultObj?.Result === true;

        debugger
  
        if (isSuccess) {
          this.notificationService.showNotification(
            'Record Saved Successfully.',
            'INFO',
            'info',
            () => {
              this.dialogRef.close();
              this.notificationService.setNotificationVisibility(false);
            }
          );
        } else {
          this.notificationService.showNotification(
            'No matching record found. Please skip this action.',
            'INFO',
            'info',
            () => {
              this.dialogRef.close();
              this.notificationService.setNotificationVisibility(false);
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
      },
    });
  }
  
}