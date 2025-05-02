import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../constant/api-constants';
import { NotificationPopupService } from '../notification-popup/notification-popup.service';
import { DownloadPdfService } from '../service/downlaodPdf.service';
//import { SharedModule } from '../shared/shared.module';
import { SharedUtils } from '../shared/shared-utils';
import { ConfirmationPopComponent } from '../confirmation-pop/confirmation-pop.component';

@Component({
  selector: 'app-afsinvoice',
  templateUrl: './afsinvoice.component.html',
  styleUrls: ['./afsinvoice.component.css']
})
export class AfsinvoiceComponent implements OnInit {
  @ViewChild('myForm') myForm: any;
  @ViewChild(ConfirmationPopComponent) popupComponent!: ConfirmationPopComponent;
  id: number = 0;
  conCode: string = "";
  contractorname: string = '';
  afscontractor: string = '';
  afsContract: string = '';
  firstnamefor: string = '';
  lastnamefor: string = '';
  startdate: string = '';
  enddate: string = '';
  totalAmount: string = '';
  invoiceNumber: string = '';
  invoiceDate: string = '';
  groupNewId: string = '';
  imageName: string = '';
  thumbImage: string = '';
  fullImagePath: string = '';
  contractorOptions: { id: number; firstName: string; lastName: string; fullName: string; conCode: string; }[] = [];
  filteredContractOptions: { id: number; name: string }[] = [];
  selectedContract: any = null;
  selectedFilteredContract: string = '';
  isPopupVisible: boolean = true;
  ctcCode: number = 0;
  gridCtcCode: number = 0;
  submitted = false;
  errors: any = {};
  IsContractIsActiveOrNot: any;
  imageWidth: number = 792;
  imageHeight: number = 490;
  pdfFileName: string = "";
  uplodedPDFFile: string = "";
  loading: boolean = false;
  isNotificationVisible: boolean = false
  currencytype: string = '';
  token: string = '';
  contract_CtcCode: string = '';
  isRecordValidated: boolean = false;
  filterRecords: any[] = [];
  iserrors:boolean = false;

  constructor(
    private dialogRef: MatDialogRef<AfsinvoiceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    public notificationService: NotificationPopupService,
    private downloadPdfService: DownloadPdfService
  ) {
    if (data.filterRecords) {
      this.filterRecords = data.filterRecords;
      this.setImagePath(data.invoiceData.invoiceFilePath, data.invoiceData.invoiceFileName);
    }
  }

  setImagePath(filePath: string, pdfFile: string): void {
    this.imageName = filePath;
    this.uplodedPDFFile = pdfFile;
    this.thumbImage = `assets/documents/pdf/${this.imageName}`;
    this.fullImagePath = `assets/documents/pdf/${this.imageName}`;

    this.pdfFileName = `assets/documents/processed-pdf/${this.uplodedPDFFile}`;

    //image with good readibility
    // this.thumbImage = `assets/documents/pdf/La fosse - SB-209461_Image20241126_120950.png`;
    // this.fullImagePath = `assets/documents/pdf/La fosse - SB-209461_Image20241126_120950.png`;

    // this.thumbImage = `assets/documents/pdf/invoice_18_04_2024_2_Image20241129_122116.png`;
    // this.fullImagePath = `assets/documents/pdf/invoice_18_04_2024_2_Image20241129_122116.png`;

    console.log('Thumb Image:', this.thumbImage);
    console.log('Full Image Path:', this.fullImagePath);

    console.log('Full pdfFileName  Path:', this.pdfFileName);
  }

  ngOnInit(): void {

    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      this.token = storedToken;
    } else {
      console.error('Token not found in localStorage.');

    }

    this.initializeFormData();
    this.fetchContractorOptions();
  }

  initializeFormData(): void {
    if (this.data && this.data.invoiceData) {
      const invData = this.data.invoiceData;

      this.id = invData.id;
      this.conCode = invData.contract_CtcContractor || '';

      this.contractorname = invData.contractorName || '';
      this.afscontractor = invData.afscontractor || '';
      this.firstnamefor = invData.cFirstName || '';
      this.lastnamefor = invData.cLastName || '';
      this.startdate = invData.startDate || '';
      this.enddate = invData.endDate || '';

      this.IsContractIsActiveOrNot = invData.errorMessage;
      this.currencytype = invData.currencyType || '';

      this.totalAmount = invData.totalAmount
        ? (invData.totalAmount.includes(' ')
          ? invData.totalAmount.split(' ')[0]
          : invData.totalAmount.trim())
        : '';
      this.invoiceNumber = invData.selfBillInvoiceNo || '';
      this.invoiceDate = invData.selfBillInvoiceDate || '';
      this.groupNewId = invData.grouP_NEWID || '';
      this.gridCtcCode = invData.contract_CtcCode || 0;
      this.contract_CtcCode = invData.contract_CtcCode || '';
      this.isRecordValidated = invData.isRecordValidated || '';

      console.log(this.conCode);
    }
  }


  fetchContractorOptions(): void {

    const apiUrl = environment.API_BASE_URL + 'OCRAI/GetContractorContractListByConName';

    let searchFullName = this.contractorname


    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const body = {
      firstNameForAFS: this.firstnamefor,
      lastNameForAFS: this.lastnamefor,
      fullName: searchFullName.replace(/\n/g, ''),
    };

    console.log(body, "let see the full name")

    this.http.post<any>(apiUrl, body, { headers }).subscribe(
      (response) => {
        if (response?.data?.contractsList) {

          localStorage.setItem('contractsList', JSON.stringify(response.data.contractsList));

          this.contractorOptions = response.data.contractsList.map((item: any) => ({
            id: item.ctcCode,
            conCode: item.conCode,
            firstName: item.conFirstName,
            lastName: item.conLastName,
            fullName: item.fullName
          }));

          if (this.conCode) {
            this.selectedContract = this.contractorOptions.find(
              (option) => option.conCode == this.conCode
            );
          }
          else {
            this.selectedContract = this.contractorOptions.find(
              (option) => option.conCode.length > 0
            );
          }

          console.log("this.selectedContract");
          console.log(this.selectedContract);

          if (this.selectedContract && this.selectedContract.conCode) {
            this.conCode = this.selectedContract.conCode;
            this.filterContractData();
          }


        }
      },
      (error) => {
        console.error('Error fetching contractor options:', error);
      }
    );
  }

  onImageLoad(event: Event): void {
    const imgElement = event.target as HTMLImageElement;

    if (imgElement && imgElement.naturalWidth && imgElement.naturalHeight) {
      this.imageWidth = imgElement.naturalWidth > 792 ? imgElement.naturalWidth : 792; // Ensure a minimum width of 492
      this.imageHeight = imgElement.naturalHeight > 492 ? imgElement.naturalHeight : 492; // Ensure a minimum height of 492
    }
  }

  filterContractData(): void {
    console.log('Selected Contractor:', this.selectedContract);
    this.filteredContractOptions = [];
    this.selectedFilteredContract = '';
    if (this.selectedContract) {
      this.errors.selectedContract = undefined;
      this.conCode = this.selectedContract.conCode;
    }

    const apiUrl = environment.API_BASE_URL + 'OCRAI/GetContractorActiveContract';
    console.log(apiUrl);
    console.log('this.ctcCode');
    console.log(this.ctcCode);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const body = {
      CtcCode: this.conCode
    };

    this.http.post<any>(apiUrl, body, { headers }).subscribe(
      (response) => {
        console.log('GetContractorActiveContract API');
        console.log(response);
        if (response?.data?.contractsList) {
          let contractsListItems = response?.data?.contractsList;
          console.log('this.selectedContract');
          console.log(this.selectedContract);
          if (contractsListItems.length > 0 && this.selectedContract) {
            this.filteredContractOptions = contractsListItems
              .filter((contract: any) => contract.conCode === this.selectedContract.conCode && contract.contracts.includes('Active'))

              .map((item: any) => ({
                id: item.ctcCode,
                name: item.contracts
              }));
            console.log('this.filteredContractOptions');
            console.log(this.filteredContractOptions);
            if (this.filteredContractOptions.length > 0) {
              this.selectedFilteredContract = this.filteredContractOptions[0].name;
              this.errors.selectedFilteredContract = undefined;
            }
            let changeNameAsperContractorChange = contractsListItems
              .filter((contract: any) => contract.conCode === this.selectedContract.conCode && contract.contracts.includes('Active'));

            if (changeNameAsperContractorChange != undefined && changeNameAsperContractorChange[0] != undefined) {
              this.firstnamefor = changeNameAsperContractorChange[0].conFirstName;
              this.lastnamefor = changeNameAsperContractorChange[0].conLastName;

              console.log(this.firstnamefor);
              console.log(this.lastnamefor);
            }
          }
        }
      },
      (error) => {
        console.error('Error fetching contractor options:', error);
      }
    );

  }

  clearValidation(field: string) {
    if ((this as any)[field]?.trim() !== '') {
      this.errors[field] = null;
    }
  }


  onPrevious() {
    this.loading = true;
    const errors: any = {};
    this.errors = errors;
    this.notificationService.setNotificationVisibility(false);
    let formData: any = {};
    const currentRecordId = this.id;
    this.filterRecords = this.filterRecords.map((record: any) => convertKeysToPascalCase(record));
    const currentIndex = this.filterRecords.findIndex((record: any) => record.Id === currentRecordId);
    
    if (this.iserrors) {
      if (currentIndex > 0) {
        const previousRecord = this.filterRecords[currentIndex - 1];
        this.fetchNextRecord(previousRecord);
      }
    }
    else{
    formData = {
      RowId: this.id,
      FirstName: this.firstnamefor,
      LastName: this.lastnamefor,
      StartDate: this.startdate,
      EndDate: this.enddate,
      totalAmount: this.totalAmount,
      invoiceNo: this.invoiceNumber,
      invoiceDate: this.invoiceDate,
      CtcCode: this.contract_CtcCode,
      CtcContractor: this.conCode,
      GroupNewId: this.groupNewId,
      IsSkip: true,
      IsPrevious: true,
      IsDelete: false
    };
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const apiUrl = environment.API_BASE_URL + 'OCRAI/ValidateAndMapToContractorContract';
    this.http.post<any>(apiUrl, formData, { headers }).subscribe({
      next: (response) => {
        this.loading = false;

        if (response.data.resultTable.length > 0) {

        //   this.filterRecords = this.filterRecords.map((record: any) => {
        //     if (record.Id === currentRecordId && !this.iserrors) {
        //       return {
        //         ...record,
        //             Id: formData.RowId,
        //             CFirstName: formData.FirstName,
        //             CLastName: formData.LastName,
        //             StartDate: formData.StartDate,
        //             EndDate: formData.EndDate,
        //             TotalAmount: formData.totalAmount,
        //             SelfBillInvoiceNo: formData.invoiceNo,
        //             SelfBillInvoiceDate: formData.invoiceDate,
        //             Contract_CtcCode: formData.CtcCode,
        //             Contract_CtcContractor: formData.CtcContractor,
        //             GrouP_NEWID: formData.GroupNewId,
        //             ContractorName : formData.FirstName + " " + formData.LastName,
        //             afscontractor: this.afscontractor
        //     };
        //     }
        //     return record;
        // });
          
          if (currentIndex > 0) {
            const previousRecord = this.filterRecords[currentIndex - 1];
            this.fetchNextRecord(previousRecord);
            this.notificationService.setNotificationVisibility(false);
          } else {
            this.notificationService.showNotification(
              'There are no previous records available. Please use the Skip action.',
              'INFO',
              'info',
              () => {
                this.notificationService.setNotificationVisibility(false);
              }
            );
          }
        } else {
          this.notificationService.showNotification(
            'No more records to process.',
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
        this.loading = false;
        this.notificationService.showNotification(
          'Unable to retrieve the previous record. Please retry.',
          'ERROR',
          'error',
          () => {
            this.notificationService.setNotificationVisibility(false);
          }
        );
      },
    });

  }

  onDelete() {
    const currentRecordId = this.id;
    this.filterRecords = this.filterRecords.map((record: any) => convertKeysToPascalCase(record));
    const currentIndex = this.filterRecords.findIndex((record: any) => record.Id === currentRecordId);

    this.popupComponent.openPopup(
      'Confirmation',
      'Are you sure that you want to proceed?',
      'warning',
      () => {

        this.loading = true;
        this.errors = {};
        this.notificationService.setNotificationVisibility(false);

        const formData = {
           RowId: this.id,
          // FirstName: this.firstnamefor,
          // LastName: this.lastnamefor,
          // StartDate: this.startdate,
          // EndDate: this.enddate,
          // GroupNewId: this.groupNewId,
          IsSkip: true,
          IsPrevious: false,
          IsDelete: true
        };

        const headers = new HttpHeaders({
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        });

        const apiUrl = environment.API_BASE_URL + 'OCRAI/ValidateAndMapToContractorContract';
        this.http.post<any>(apiUrl, formData, { headers }).subscribe({
          next: (response) => {
            this.loading = false;

            if (response?.data?.resultTable?.length > 0){
              if (currentIndex > -1 && currentIndex + 1 < this.filterRecords.length) {
                const nextRecord = this.filterRecords[currentIndex + 1];
                this.fetchNextRecord(nextRecord);
                this.filterRecords = this.filterRecords.filter((record: any) => record.Id !== currentRecordId);
                this.notificationService.showNotification(
                  'Record has been successfully deleted. Retrieving the next record.',
                  'SUCCESS',
                  'success',
                  () => {
                    this.notificationService.setNotificationVisibility(false);
                  }
                );
              }
              else {
                this.notificationService.showNotification(
                  'No further records available.',
                  'INFO',
                  'info',
                  () => {
                    this.dialogRef.close();
                    this.notificationService.setNotificationVisibility(false);
                  }
                );
              }         
            }else {
              this.notificationService.showNotification(
                'No more records to Delete.',
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
            this.loading = false;
            console.error("Error in deletion:", error);
            this.notificationService.showNotification(
              'Unable to delete the record. Please retry.',
              'ERROR',
              'error',
              () => {
                this.notificationService.setNotificationVisibility(false);
              }
            );
          },
        });
      })
  }

  onSkip() {
     this.loading = true;
    const errors: any = {};
    this.errors = errors;
    let isValid = true;
    this.notificationService.setNotificationVisibility(false);
    const currentRecordId = this.id;
    this.filterRecords = this.filterRecords.map((record: any) => convertKeysToPascalCase(record));
    const inputstartdateDate = new Date(this.startdate);
    const startdateyear = inputstartdateDate.getFullYear();

    if (startdateyear < 1900) {
      isValid = false;
      errors.startDate = 'Invalid StartDate.';
      this.loading = false;
    }

    const inputendDate = new Date(this.enddate);
    const endyear = inputendDate.getFullYear();

    if (endyear < 1900) {
      isValid = false;
      this.loading = false;
      errors.endDate = 'Invalid EndDate.';
    }

    if (!errors.startDate && !errors.endDate && this.startdate && this.enddate) {
      const start = new Date(this.startdate);
      const end = new Date(this.enddate);


      const startYear = start.getFullYear();
      const startMonth = start.getMonth();
      const endYear = end.getFullYear();
      const endMonth = end.getMonth();


      if (startYear !== endYear || startMonth !== endMonth) {
        isValid = false;
        errors.endDate = 'Date must be within the same month and year.';
        this.loading = false;
      }
    }

    if (this.startdate && this.enddate) {
      const startDateObj = new Date(this.startdate);
      const endDateObj = new Date(this.enddate);

      if (startDateObj > endDateObj) {
        errors.dateComparison = 'Start Date cannot be greater than End Date.';
        isValid = false;
        this.loading = false;
      }
    }

    if (
      !this.totalAmount ||
      this.totalAmount.trim() === '' ||
      isNaN(Number(this.totalAmount)) ||
      Number(this.totalAmount) <= 0
    ) {
      errors.totalAmount = 'Total Amount should be a valid number greater than 0.';
      isValid = false;
      this.loading = false
    }

    const inputinvoiceDate = new Date(this.invoiceDate);
    const invoiceyear = inputinvoiceDate.getFullYear();


    if (invoiceyear < 1900) {
      isValid = false;
      this.loading = false;
      errors.invoiceDate = 'Invalid Invoice Date.';
    }
    
    if (!isValid) {
      this.iserrors = true 
          return;
      }
     
    

    const formData = {
      RowId: this.id,
      FirstName: this.firstnamefor,
      LastName: this.lastnamefor,
      StartDate: this.startdate,
      EndDate: this.enddate,
      totalAmount: this.totalAmount,
      invoiceNo: this.invoiceNumber,
      invoiceDate: this.invoiceDate,
      CtcCode: this.contract_CtcCode,
      CtcContractor: this.conCode,
      GroupNewId: this.groupNewId,
      IsSkip: true,
      IsPrevious: false,
      IsDelete: false
    };
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    const apiUrl = environment.API_BASE_URL + 'OCRAI/ValidateAndMapToContractorContract';
    this.http.post<any>(apiUrl, formData, { headers }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.data.resultTable.length > 0) {
          
          this.filterRecords = this.filterRecords.map((record: any) => {
            if (record.Id === currentRecordId) {
                return {
                    ...record,
                    Id: formData.RowId,
                    CFirstName: formData.FirstName,
                    CLastName: formData.LastName,
                    StartDate: formData.StartDate,
                    EndDate: formData.EndDate,
                    TotalAmount: formData.totalAmount,
                    SelfBillInvoiceNo: formData.invoiceNo,
                    SelfBillInvoiceDate: formData.invoiceDate,
                    Contract_CtcCode: formData.CtcCode,
                    Contract_CtcContractor: formData.CtcContractor,
                    GrouP_NEWID: formData.GroupNewId,
                    ContractorName : formData.FirstName + " " + formData.LastName,
                    afscontractor: this.afscontractor
                };
            }
            return record;
        });
          const currentIndex = this.filterRecords.findIndex((record: any) => record.Id === currentRecordId);

          if (currentIndex > -1 && currentIndex + 1 < this.filterRecords.length) {

            const nextRecord = this.filterRecords[currentIndex + 1];

            this.fetchNextRecord(nextRecord);
            this.notificationService.setNotificationVisibility(false);

          } else {
            this.notificationService.showNotification(
              'All records have been processed.',
              'INFORMATION',
              'success',
              () => {
                this.dialogRef.close();
                this.notificationService.setNotificationVisibility(false);
              }
            );
          }

        } else {
          this.notificationService.showNotification(
            'No more records to process.',
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
        this.loading = false;
        this.notificationService.showNotification(
          'Unable to complete the skip action. Please retry.',
          'ERROR',
          'error',
          () => {
            this.notificationService.setNotificationVisibility(false);
          }
        );
      },
    });
  }

  onSubmit(form: any): void {

    this.submitted = true;
    let isValid = true;
    const errors: any = {};

    const currentRecordId = this.id;
    let nextRecord: any = null;
    this.filterRecords = this.filterRecords.map((record: any) => convertKeysToPascalCase(record));
    const currentIndex = this.filterRecords.findIndex((record: any) => record.Id === currentRecordId);

    if (!this.selectedContract) {
      errors.selectedContract = 'AFS Contractor is required.';
      isValid = false;
    }

    if (!this.selectedFilteredContract) {
      errors.selectedFilteredContract = 'AFS Contract is required.';
      isValid = false;
    }

    if (!this.firstnamefor || this.firstnamefor.trim() === '') {
      errors.firstName = 'First Name is required.';
      isValid = false;
    }

    if (!this.lastnamefor || this.lastnamefor.trim() === '') {
      errors.lastName = 'Last Name is required.';
      isValid = false;
    }
    if (
      !this.totalAmount ||
      this.totalAmount.trim() === '' ||
      isNaN(Number(this.totalAmount)) ||
      Number(this.totalAmount) <= 0
    ) {
      errors.totalAmount = 'Total Amount should be a valid number greater than 0.';
      isValid = false;
      this.loading = false
    }

    const startDate = SharedUtils.validateDate(this.startdate, 'Start Date', true);
    if (startDate) {
      isValid = false;
      errors.startDate = startDate;
    }



    console.log('end date', this.enddate)
    const endDate = SharedUtils.validateDate(this.enddate, 'End Date', true);
    if (endDate) {
      isValid = false;
      errors.endDate = endDate;
    }


    if (!errors.startDate && !errors.endDate) {
      const start = new Date(this.startdate);
      const end = new Date(this.enddate);


      const startYear = start.getFullYear();
      const startMonth = start.getMonth();
      const endYear = end.getFullYear();
      const endMonth = end.getMonth();


      if (startYear !== endYear || startMonth !== endMonth) {
        isValid = false;
        errors.endDate = 'Date must be within the same month and year.';
      }
    }


    const invoiceDate = SharedUtils.validateDate(this.invoiceDate, 'Invoice Date', false);
    if (invoiceDate) {
      isValid = false;
      errors.invoiceDate = invoiceDate;
    }

    if (this.startdate && this.enddate) {
      const startDateObj = new Date(this.startdate);
      const endDateObj = new Date(this.enddate);

      if (startDateObj > endDateObj) {
        errors.dateComparison = 'Start Date cannot be greater than End Date.';
        isValid = false;
      }
    }
    this.errors = errors;

    if (!isValid) {
      this.iserrors = true 
          return;
      }

    else{

      const formData = {
        RowId: this.id,
        FirstName: this.firstnamefor,
        LastName: this.lastnamefor,
        StartDate: this.startdate,
        EndDate: this.enddate,
        totalAmount: this.totalAmount,
        invoiceNo: this.invoiceNumber,
        invoiceDate: this.invoiceDate,
        CtcCode: this.contract_CtcCode,
        CtcContractor: this.conCode,
        GroupNewId: this.groupNewId,
        IsSkip: false,
        IsPrevious: false,
        IsDelete: false
      };

      this.loading = true

      console.log('formData:', formData);

      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      });

      const apiUrl = environment.API_BASE_URL + 'OCRAI/ValidateAndMapToContractorContract';
      this.http.post<any>(apiUrl, formData, { headers }).subscribe({
        next: (response) => {
          
          if (currentIndex > -1 && currentIndex + 1 < this.filterRecords.length) {

            nextRecord = this.filterRecords[currentIndex + 1];
          }

          switch (response.data.validationResult) {
            case -1:

              this.loading = false

              this.notificationService.showNotification(
                'Error occurred in validation process.',
                'ERROR',
                'error',
                () => {
                  console.log('OK clicked!');
                  this.notificationService.setNotificationVisibility(false);

                }
              );
              break;

            case 1:
              this.loading = false
              this.notificationService.showNotification(
                'No row validated.',
                'INFORMATION',
                'success',
                () => {
                  console.log('OK clicked 1');
                  console.log('response');
                  console.log(response);
                  if (nextRecord) {
                    this.fetchNextRecord(nextRecord);
                  }
                }
              );
              break;

            case 2:
              this.loading = false;
              this.filterRecords = this.filterRecords.filter((record: any) => record.Id !== currentRecordId);
              this.notificationService.showNotification(
                'The records have been successfully validated and moved.',
                'INFORMATION',
                'success',
                () => {
                  console.log('OK clicked 2');
                  console.log('response');
                  console.log(response);
                  if (nextRecord) {
                    this.filterRecords = this.filterRecords.filter((record: any) => record.Id !== currentRecordId);
                    this.fetchNextRecord(nextRecord);
                  }
                }
              );
              break;

            case 3:
              this.loading = false

              this.notificationService.showNotification(
                'Error in validation process.',
                'ERROR',
                'error',
                () => {
                  console.log('OK clicked 3');
                  console.log('response');
                  console.log(response);
                  this.notificationService.setNotificationVisibility(false);
                }
              );
              break;

            case 4:
              console.log("case 4 is clicked ");
              this.loading = false;

              if (response.data.resultTable.length > 0) {
                const recordFromDb = response.data.resultTable[0];

                if (recordFromDb.Message === 'All rows complete') {
                    this.notificationService.showNotification(
                      'The records have been successfully validated and moved. And all records have been processed.',
                      'INFORMATION',
                      'success',
                      () => {
                        this.dialogRef.close();
                        this.notificationService.setNotificationVisibility(false);
                      }
                    );
                  } else {
                  this.notificationService.showNotification(
                    'The records have been successfully validated and moved.',
                    'INFORMATION',
                    'success',
                    () => {
                      console.log('OK clicked 4');
                      console.log('response' + response.data.resultTable.length);
                      console.log(response);
                      this.filterRecords = this.filterRecords.filter((record: any) => record.Id !== currentRecordId);
                      this.fetchNextRecord(nextRecord);

                      this.notificationService.setNotificationVisibility(false);
                    }
                  );
                }
              }

              break;


            case 5:
              console.log("case 5 is clicked ")
              this.loading = false

              this.notificationService.showNotification(
                'The selected period must fall within the contracts start and end dates.',
                'INFORMATION',
                'success',
                () => {


                  console.log('OK clicked 5');
                  console.log('response' + response.data.resultTable.length);
                  console.log(response);
                  this.notificationService.setNotificationVisibility(false);
                }
              );
              break;

            case 6:
              console.log("case 6 is clicked ")
              this.loading = false
              this.notificationService.showNotification(
                'The selected timesheet period is already registered in the contract.',
                'INFORMATION',
                'success',
                () => {


                  console.log('OK clicked 6');
                  console.log('response' + response.data.resultTable.length);
                  console.log(response);
                  this.notificationService.setNotificationVisibility(false);
                }
              );
              break;
            case 7:
              console.log("case 7 is clicked ")
              this.loading = false
              this.notificationService.showNotification(
                'Contract is not mapped',
                'INFORMATION',
                'success',
                () => {


                  console.log('OK clicked 7');
                  console.log('response' + response.data.resultTable.length);
                  console.log(response);
                  this.notificationService.setNotificationVisibility(false);
                }
              );
              break;

            case 8:
              console.log("case 8 is clicked ")
              this.loading = false
              this.notificationService.showNotification(
                'The contract is not Active',
                'INFORMATION',
                'success',
                () => {


                  console.log('OK clicked 8');
                  console.log('response' + response.data.resultTable.length);
                  console.log(response);
                  this.notificationService.setNotificationVisibility(false);
                }
              );
              break;



            default:
              this.loading = false
              this.notificationService.showNotification(
                'Unhandled validation result:',
                'WARNING',
                'Warning',
                () => {
                  console.log('OK clicked default');
                  this.notificationService.setNotificationVisibility(false);
                }
              );
              break;
          }
        },
        error: (error) => {
          this.loading = false
          this.notificationService.showNotification(
            'There was an error submitting the form. Please try again.',
            'ERROR',
            'error',
            () => {
              console.log('OK clicked error');
            }
          );
        },
      });
    }
  }

  fetchNextRecord(data: any): void {
    this.id = data.Id;
    this.conCode = data.Contract_CtcContractor || '';
    this.contractorname = data.ContractorName || '';
    this.afscontractor = data.afscontractor || '';
    this.firstnamefor = data.CFirstName || '';
    this.lastnamefor = data.CLastName || '';
    this.startdate = data.StartDate || '';
    this.enddate = data.EndDate || '';
    this.totalAmount = data.TotalAmount?.includes(' ') ? data.TotalAmount.split(' ')[0] : data.TotalAmount?.trim() || '';
    this.invoiceNumber = data.SelfBillInvoiceNo || '';
    

    this.invoiceDate = data.SelfBillInvoiceDate || '';
    this.contract_CtcCode = data.Contract_CtcCode || '';

    this.groupNewId = data.GrouP_NEWID || '';
    this.gridCtcCode = data.Contract_CtcCode || 0;
    this.currencytype = data.CurrencyType || '';
    this.imageName = data.InvoiceFilePath;
    this.uplodedPDFFile = data.InvoiceFileName;


    this.resetAFSContractorDropdown();
    this.fetchContractorOptions();
    this.resetAFSContractDropdown();
    this.setImagePath(this.imageName, this.uplodedPDFFile);
    this.IsContractIsActiveOrNot = data.ErrorMessage;
  }

  resetAFSContractorDropdown(): void {
    this.selectedContract = '';
    this.contractorOptions = [];
  }


  resetAFSContractDropdown(): void {
    this.selectedFilteredContract = '';
    this.filteredContractOptions = [];
  }
  submitForm(): void {
    if (this.myForm) {
      this.myForm.ngSubmit.emit();
    }
  }


  isModalOpen = true;

  closeDialog(): void {
    this.dialogRef.close();
  }

  downloadPdfFile(data: any) {
    console.log(data);
    const fileUrl = environment.API_BASE_URL + `assets/documents/processed-pdf/${data.InvoiceFileName}`;

    this.downloadPdfService.downloadPdf(fileUrl).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'file.pdf';
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  getDateRange(): { min: string; max: string } {
    if (!this.startdate) {
      return { min: '', max: '' };
    }

    const [day, month, year] = this.startdate.split('/').map(Number);

    if (!day || !month || !year) {
      return { min: '', max: '' };
    }

    const start = new Date(year, month - 1, day);

    if (isNaN(start.getTime())) {
      return { min: '', max: '' };
    }

    const minDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const maxDate = new Date(year, month, 0).toISOString().split('T')[0];

    return { min: minDate, max: maxDate };
  }


  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }

  onContractorNameBlur(): void {
    console.log('Contractor Name field lost focus:', this.contractorname);
    this.loading = true;
    if (this.contractorname) {
      this.fetchContractorOptions();
    }
    this.loading = false;
  }

}

function convertKeysToPascalCase(obj: any): any {
  const newObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
      newObj[pascalKey] = obj[key];
    }
  }
  return newObj;
}
