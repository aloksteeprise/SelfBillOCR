import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constant/api-constants';
import { PaginationResponse } from '../transaction-form/transaction-form';

@Injectable({
  providedIn: 'root'
})
export class TransactionFormService {
  private apiUrl = environment.API_BASE_URL + 'OCRAI/GetIntraDayStatemenData';

  constructor(private http: HttpClient) { }

  getTransaction(
    pageIndex: number,
    pageSize: number,
    SortColumn: string | null = null,
    SortDirection: string | null = null,
    invoiceNumber:string | null = null,
    mvtDate:string | null = null , 
    mvtValueDate:string | null = null,
    mvtType:string | null = null,
    IsRecordAllocated: boolean,
  ): Observable<PaginationResponse<any>> {
  
  

    const body = {
      pageIndex,
      pageSize,
      SortColumn,      
      SortDirection,
      invoiceNumber,
      mvtDate,
      mvtValueDate,
      mvtType,
      IsRecordAllocated
    };
    

    console.log('Request Body:', body); // Log the request body for debugging

    return this.http.post<PaginationResponse<any>>(this.apiUrl, body);
  }
}
