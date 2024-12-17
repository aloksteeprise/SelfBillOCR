export interface Invoice {
  docCode: number;
  docDescription: string;
  ctdDesc: string;
  }

  export interface PaginationResponse<T> {
    data: T[];
    totalRecords: number; // Total records
  }