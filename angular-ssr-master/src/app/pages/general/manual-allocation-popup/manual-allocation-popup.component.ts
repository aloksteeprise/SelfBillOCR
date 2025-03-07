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
  amountPaid : number = 0;
  invoiceNo : number = 0;
  fundSource : string = '';
  fundDescription : string = '';
  token: string = '';
  loading: boolean = false;
  
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

  onSubmit(form: any): void {
    // Handle form submission logic here
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  submitForm(): void {
    if (this.myForm) {
      this.myForm.ngSubmit.emit();
    }
  }
}