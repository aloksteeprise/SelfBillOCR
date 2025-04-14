export interface BungeInvoicing {
    // docCode: string;
    // docDescription: string;
    // ctdDesc: string;
    id:number;
    contractorName: string;
    cFirstName:string;
    cLastName:string; 
    startDate:string;
    endDate:string;
    currencyType:string;
    amount:string;
    totalAmount:string;
    selfBillInvoiceNo:string;
    selfBillInvoiceContractNo:string;
    week:string;
    isMapedContract:boolean;
    errorID:number;
    errorMessage:string;
    afsInvoiceStatus:string;
    isChecked?: boolean;  // Add this property
    // Add other fields as needed
  }
  
  export interface PaginationResponse<T> {
    data: T[];
    totalRecords: number; // Total records
  }