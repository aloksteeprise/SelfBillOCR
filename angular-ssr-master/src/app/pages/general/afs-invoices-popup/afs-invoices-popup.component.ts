import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import {environment} from '../constant/api-constants';

@Component({
  selector: 'app-afs-invoices-popup',
  templateUrl: './afs-invoices-popup.component.html',
  styleUrls: ['./afs-invoices-popup.component.css'],
})
export class AfsInvoicesPopupComponent implements OnInit {
  // Form fields
  id:number = 0;
  contractorname: string = '';
  afscontractor: string = '';
  afsContract: string = '';
  firstnamefor:string = '';
  lastnamefor:string = '';
  startdate: string = '';
  enddate: string = ''; 
  totalAmount: string = ''; 
  invoiceNumber: string = '';
  invoiceDate: string = '';
  groupNewId: string = '';
  imageName: string = '';
  thumbImage: string = '';
  fullImagePath: string = '';
  contractorOptions: { id: number; firstName: string; lastName: string;fullName: string; }[] = []; // For first dropdown
  filteredContractOptions: { id: number; name: string }[] = []; // For filtered second dropdown
  //selectedContract: string = ''; // Holds the selected contractor from the first dropdown
  selectedContract: any = null; // Holds the selected contractor object
  selectedFilteredContract: string = ''; // Holds the selected filtered contract from the second dropdown
  isPopupVisible: boolean = true;
  ctcCode: number = 0;
  gridCtcCode: number = 0;
  
  constructor(
    public dialogRef: MatDialogRef<AfsInvoicesPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient // Injecting HttpClient service
  ) {

    this.setImagePath(data.invoiceFilePath);

  }

  setImagePath(filePath: string): void {
    
    this.imageName = filePath;
    this.thumbImage = `assets/documents/pdf/${this.imageName}`;
    this.fullImagePath = `assets/documents/pdf/${this.imageName}`;
  
    console.log('Thumb Image:', this.thumbImage);
    console.log('Full Image Path:', this.fullImagePath);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
  ngOnInit(): void {
    this.initializeFormData();
    this.fetchContractorOptions(); // Fetch API data for dropdown
  }

  initializeFormData(): void {
    if (this.data) {
      
      this.id = this.data.id;
      this.contractorname = this.data.contractorName || '';
      this.afscontractor = this.data.afscontractor || '';
      this.firstnamefor = this.data.cFirstName || '';
      this.lastnamefor = this.data.cLastName || '';
      this.startdate = this.data.startDate || '';
      this.enddate = this.data.endDate || '';
      
      // Remove currency 
      this.totalAmount = this.data.totalAmount.includes(' ') ? this.data.totalAmount.split(' ')[0] : this.data.totalAmount.trim();
      this.invoiceNumber = this.data.selfBillInvoiceNo || '';
      this.invoiceDate = this.data.selfBillInvoiceDate || '';
      this.groupNewId = this.data.grouP_NEWID || '';
      this.gridCtcCode = this.data.contract_CtcCode || 0;
      console.log(this.ctcCode);
    }
  }

  fetchContractorOptions(): void {
    
    //const apiUrl = 'https://localhost:44337/api/OCRAI/GetContractorContractListByConName'; // Replace with your API URL
    
    const apiUrl = environment.API_BASE_URL+'OCRAI/GetContractorContractListByConName';
    // Sending request to API
    
    this.http.post<any>(apiUrl, { firstNameForAFS: this.firstnamefor,lastNameForAFS:this.lastnamefor,fullName: this.contractorname }).subscribe(
      (response) => {
        // Assign the list of contractors to the dropdown options
        if (response?.data?.contractsList) {
          
          // Store the entire contractsList in localStorage
          localStorage.setItem('contractsList', JSON.stringify(response.data.contractsList));
          this.contractorOptions = response.data.contractsList.map((item: any) => ({
            id: item.ctcCode, // Use ctcCode as ID
            firstName: item.conFirstName, // Use conFirstName for dropdown display
            lastName:item.conLastName,
            fullName:item.fullName
          }));
          //Set the selected contract if `this.gridCtcCode` matches any option's `id`
          this.selectedContract = this.contractorOptions.find(
            (option) => option.id === Number(this.gridCtcCode)
          );

          if (this.selectedContract) {
            this.filterContractData();
          }
        }
      },
      (error) => {
        console.error('Error fetching contractor options:', error);
      }
    );
  }
  

  // Filter contractor data and bind it to the second dropdown
  filterContractData(): void {
    console.log('Selected Contractor:', this.selectedContract);

    // Clear the previous filtered options
    this.filteredContractOptions = [];
    this.selectedFilteredContract = '';

    // Retrieve the contracts list from localStorage
    const storedContractsList = JSON.parse(localStorage.getItem('contractsList')!);

    if (storedContractsList && this.selectedContract) {
        // Filter and map contracts
        this.filteredContractOptions = storedContractsList
            .filter((contract: any) => contract.fullName === this.selectedContract.fullName)
            .map((item: any) => ({
                id: item.ctcCode,
                name: item.contracts // Assuming "contracts" field is what you want to display
            }));

        // Select the first record by default
        if (this.filteredContractOptions.length > 0) {
            this.selectedFilteredContract = this.filteredContractOptions[0].name;
        }
    }
}
  // Form submission handler
  onSubmit(form: any): void {
    if (form.valid) {
      const formData = {
        RowId: this.id,
        FirstName: this.firstnamefor,
        LastName: this.lastnamefor,
        StartDate: this.startdate,
        EndDate: this.enddate,
        GroupNewId: this.groupNewId,
      };
  
      console.log('formData:', formData);
  
      //const apiUrl = 'https://localhost:44337/api/OCRAI/ValidateAndMapToContractorContract';
      const apiUrl = environment.API_BASE_URL+'OCRAI/ValidateAndMapToContractorContract';
      this.http.post<any>(apiUrl, formData).subscribe({
        next: (response) => {
          switch (response.data.validationResult) {
            case -1:
              alert('Error occurred!');
              break;
    
            case 1:
              alert('No rows updated!');
              this.fetchNextRecord(response.data.resultTable[0]);
              break;
    
            case 2:
              alert('Update successful!');
              this.fetchNextRecord(response.data.resultTable[0]);
              break;
    
            case 3:
              alert('Error in usp_UpdateContractorInfoInInvoice!');
              this.fetchNextRecord(response.data.resultTable[0]);
              break;
    
            case 4:
              alert('Contractor info updated!');
              this.fetchNextRecord(response.data.resultTable[0]);
              break;
    
            default:
              console.warn('Unhandled validation result:', response.data.validationResult);
              break;
          }
        },
        error: (error) => {
          console.error('API Error:', error);
          alert('There was an error submitting the form. Please try again.');
        },
      });
    } else {
      alert('Please fill out all required fields.');
    }
  }
  


  fetchNextRecord(data: any): void {
    
    this.id = data.ID;
    this.contractorname ='';
    this.contractorname = data.ContractorName || '';
    this.afscontractor = data.afscontractor || '';
    this.firstnamefor = data.CFirstName || '';
    this.lastnamefor = data.CLastName || '';
    this.startdate = data.StartDate || '';
    this.enddate = data.EndDate || '';
    this.totalAmount = data.TotalTaxAmount?.includes(' ') ? data.TotalTaxAmount.split(' ')[0] : data.TotalTaxAmount?.trim() || '';
    this.invoiceNumber = data.SelfBillInvoiceNo || '';
    this.invoiceDate = data.SelfBillInvoiceDate || '';
    this.groupNewId = data.GROUP_NEWID || '';
    this.gridCtcCode = data.Contract_CtcCode || 0;
    this.imageName = data.InvoiceFilePath;
    this.resetAFSContractorDropdown();
    this.fetchContractorOptions();
    this.resetAFSContractDropdown();
    this.setImagePath(this.imageName);
  }

  resetAFSContractorDropdown(): void {
    this.selectedContract = ''; // Clear the selected value
    this.contractorOptions = []; // Clear the list of options
  }

  resetAFSContractDropdown(): void {
    this.selectedFilteredContract = ''; // Clear the selected value
    this.filteredContractOptions = []; // Clear the list of options
  }
}
