export interface afsInvoice {
    docCode: string;
    docDescription: string;
    ctdDesc: string;
    // Add other fields as needed
  }
  
  export interface PaginationResponse<T> {
    data: T[];
    total: number; // Total records
  }