// import { Component, Inject } from '@angular/core';
// import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
// import { NgForm } from '@angular/forms';

// @Component({
//   selector: 'app-afs-invoices-popup',
//   templateUrl: './afs-invoices-popup.component.html',
//   styleUrls: ['./afs-invoices-popup.component.css']
// })
// export class AfsInvoicesPopupComponent {
//   contractorname: string;
//   startDate: string;

//   constructor(
//     @Inject(MAT_DIALOG_DATA) public data: any,
//     private dialogRef: MatDialogRef<AfsInvoicesPopupComponent>
//   ) {
//     // Initialize the form fields with the passed data
//     debugger;
//     this.contractorname = data.contractorName;
//     this.startDate = data.startDate;
//   }

//   // Handle form submission
//   onSubmit(form: NgForm) {
//     if (form.valid) {
//       // Emit the data back to the parent
//       this.dialogRef.close({
//         contractorname: this.contractorname,
//         startDate: this.startDate
//       });
//     }
//   }

//   // Close the modal without saving
//   closeModal() {
//     this.dialogRef.close();
//   }
// }

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-afs-invoices-popup',
  templateUrl: './afs-invoices-popup.component.html',
  styleUrls: ['./afs-invoices-popup.component.css']
})
export class AfsInvoicesPopupComponent implements OnInit {
  // Form fields
  contractorname: string = ''; // Invoice number
  afscontractor: string = ''; // Title
  startdate: string = ''; // Date
  enddate: string = ''; // Type (Expense/Income)
  totalnumber: string = ''; // Category
  invoicenumber: string = ''; // Payment instrument
  invoicedate: string = ''; // Country
  SelfBIllcontractid: number = 0; // Value

  // Image Zoom Fields
  mythumbImage: string = ''; // Path to the thumbnail image
  myfullImagePath: string = ''; // Path to the full image

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
  // myfullImagePath = 'assets/documents/image.png';
  // mythumbImage = 'assets/documents/image.png';

  ngOnInit(): void {
    // Initialize the fields with the provided data
    if (this.data) {
      debugger;
      this.contractorname = this.data.contractorName || '';
      this.afscontractor = this.data.afscontractor || '';
      this.startdate = this.data.startdate || '';
      this.enddate = this.data.enddate || '';
      this.totalnumber = this.data.totalnumber || '';
      this.invoicenumber = this.data.invoicenumber || '';
      this.invoicedate = this.data.invoicedate || '';
      this.SelfBIllcontractid = this.data.SelfBIllcontractid || 0;

      // Initialize image paths if available in data
      this.mythumbImage = this.data.mythumbImage || 'assets/images/thumbnail.jpg';
      this.myfullImagePath = this.data.myfullImagePath || 'assets/images/full-image.jpg';
    }
  }

  // Form submission handler
  onSubmit(form: any): void {
    if (form.valid) {
      const formData = {
        contractorname: this.contractorname,
        afscontractor: this.afscontractor,
        startdate: this.startdate,
        enddate: this.enddate,
        totalnumber: this.totalnumber,
        invoicenumber: this.invoicenumber,
        invoicedate: this.invoicedate,
        SelfBIllcontractid: this.SelfBIllcontractid,
      };

      console.log('Form Submitted Successfully:', formData);

      // Add your logic to send data to the server or handle it
      alert('Form submitted successfully!');
    } else {
      alert('Please fill out all required fields.');
    }
  }
}

