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

  bankPaymentDate : string = '';
  amountPaid : string = '';
  invoiceNo : string = '';
  fundSource : string = '';
  fundDescription : string = '';
  token: string = '';
  errors: any = {};
  // loading: boolean = false;
  
  constructor(private dialogRef: MatDialogRef<ManualAllocationPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {

    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.token = storedToken; 
    } else {
      console.error('Token not found in localStorage.');
     
    }
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

  submitForm(): void {
    if (this.myForm) {
      this.myForm.ngSubmit.emit();
    }
  }
  clearValidation(field: string) {
    if ((this as any)[field]?.trim() !== '') {
      this.errors[field] = null;
    }
  }

  onSubmit(form: any): void {
    let isValid = true;
    this.errors = {}; 
  
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
  
    // if (!isValid) {
    //   return; 
    // }
  
    console.log("Form submitted successfully", form.value);
  }
  
}