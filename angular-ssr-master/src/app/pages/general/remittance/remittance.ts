export interface Invoice {
  // docCode: number;
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
  }

  export interface PaginationResponse<T> {
    data: T[];
    totalRecords: number; // Total records
  }