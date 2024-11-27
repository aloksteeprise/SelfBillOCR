import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-afs-invoices-popup',
  templateUrl: './afs-invoices-popup.component.html',
  styleUrls: ['./afs-invoices-popup.component.css'],
})
export class AfsInvoicesPopupComponent implements OnInit {
  // Form fields
  contractorname: string = '';
  afscontractor: string = '';
  firstnamefor:string = '';
  lastnamefor:string = '';
  startdate: string = '';
  enddate: string = ''; 
  totalnumber: string = ''; 
  invoicenumber: string = '';
  invoicedate: string = '';
  SelfBIllcontractid: number = 0;
  thumbImage: string;
  fullImagePath: string;
  contractorOptions: { id: number; firstName: string; lastName: string;fullName: string; }[] = []; // For first dropdown
  filteredContractOptions: { id: number; name: string }[] = []; // For filtered second dropdown
  //selectedContract: string = ''; // Holds the selected contractor from the first dropdown
  selectedContract: any = null; // Holds the selected contractor object
  selectedFilteredContract: string = ''; // Holds the selected filtered contract from the second dropdown

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient // Injecting HttpClient service
  ) {
    // These should now have values because they are being passed in the `data` object
    this.thumbImage = data?.thumbImage;
    this.fullImagePath = data?.fullImagePath;
    console.log('Thumb Image:', this.thumbImage);
    console.log('Full Image Path:', this.fullImagePath);
  }

  ngOnInit(): void {
    this.initializeFormData();
    this.fetchContractorOptions(); // Fetch API data for dropdown
  }

  initializeFormData(): void {
    if (this.data) {
      this.contractorname = this.data.contractorName || '';
      this.afscontractor = this.data.afscontractor || '';
      this.startdate = this.data.startdate || '';
      this.enddate = this.data.enddate || '';
      this.totalnumber = this.data.totalnumber || '';
      this.invoicenumber = this.data.invoicenumber || '';
      this.invoicedate = this.data.invoicedate || '';
      this.SelfBIllcontractid = this.data.SelfBIllcontractid || 0;
      //this.firstname = this.firstname || '';
      //this.lastname = this.lastname || '';
    }
  }

  fetchContractorOptions(): void {
    const apiUrl = 'https://localhost:44337/api/OCRAI/GetContractorContractListByConName'; // Replace with your API URL

    // Sending request to API
    this.http.post<any>(apiUrl, { contractorName: this.data.contractorName }).subscribe(
      (response) => {
        // Assign the list of contractors to the dropdown options
        if (response?.data?.contractsList) {
          debugger;
          // Store the entire contractsList in localStorage
          localStorage.setItem('contractsList', JSON.stringify(response.data.contractsList));
          this.contractorOptions = response.data.contractsList.map((item: any) => ({
            id: item.ctcCode, // Use ctcCode as ID
            firstName: item.conFirstName, // Use conFirstName for dropdown display
            lastName:item.conLastName,
            fullName:item.fullName
          }));
        }
      },
      (error) => {
        console.error('Error fetching contractor options:', error);
      }
    );
  }

  // Filter contractor data and bind it to the second dropdown
  filterContractData(): void {
    debugger;
    console.log('Selected Contractor:', this.selectedContract);
    // Clear the previous filtered options
    this.filteredContractOptions = [];
    this.selectedFilteredContract = '';
    // Retrieve the contracts list from localStorage
    const storedContractsList = JSON.parse(localStorage.getItem('contractsList')!);
    this.firstnamefor = this.selectedContract ? this.selectedContract.firstName : '';
    this.lastnamefor = this.selectedContract ? this.selectedContract.lastName : '';
    if (storedContractsList && this.selectedContract) {
      // Filter contracts based on the selected contractor's fullName
      this.filteredContractOptions = storedContractsList
        .filter((contract: any) => contract.fullName === this.selectedContract.fullName)
        .map((item: any) => ({
          id: item.ctcCode,
          name: item.contracts // Assuming "contracts" field is what you want to display
        }));
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
