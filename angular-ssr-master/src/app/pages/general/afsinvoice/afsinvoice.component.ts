import { Component, ElementRef, OnInit, ViewChild  } from '@angular/core';

@Component({
  selector: 'app-afsinvoice',
  // standalone: true,
  // imports: [],
  templateUrl: './afsinvoice.component.html',
  styleUrl: './afsinvoice.component.css'
})
export class AfsinvoiceComponent implements OnInit {

  // invoicenumber: string = '';
  contractorname: string = '';
  afscontractor: string = '';
  afscontact: string = '';
  startdate: string | null = null;
  enddate: string | null = null;
  invoicedate: string | null = null;
  totalnumber: number | null = null;

  SelfBIllcontractid: string = '';
  invoicenumber: number | null = null;

  submitted = false;
  myfullImagePath = 'assets/documents/image.png';
  mythumbImage = 'assets/documents/image.png';

  

  constructor() {}

  ngOnInit(): void {}

  onSubmit(form: any) {
    this.submitted = true;
    if (form.valid) {
      console.log('Form submitted successfully');
    } else {
      console.log('Form is invalid');
    }
  }


}

