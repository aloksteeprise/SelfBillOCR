import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constant/api-constants';
import { PaginationResponse } from '../transaction-form/transaction-form';

@Injectable({
  providedIn: 'root'
})
export class TransactionFormService {
  private apiUrl = environment.API_BASE_URL + 'OCRAI';

  constructor(private http: HttpClient) { }

  getTransaction(
    pageIndex: number,
    pageSize: number,
    SortColumn: string | null = null,
    SortDirection: string | null = null,
    mvtFromDate:string | null = null,
    mvtToDate:string | null = null , 
    MvtValueFromDate:string | null = null,
    MvtValueToDate:string | null =null,
    bankAccount:string | null = null,
    money:boolean,
    IsRecordAllocated: boolean,
    token:string
  ): Observable<PaginationResponse<any>> {
    const body = {
      pageIndex,
      pageSize,
      SortColumn,      
      SortDirection,
      mvtFromDate,
      mvtToDate,
      MvtValueFromDate,
      MvtValueToDate,
      bankAccount,
      money,
      IsRecordAllocated,
      token
    };
    

    console.log('Request Body:', body);
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post<PaginationResponse<any>>(
      `${this.apiUrl}/GetIntraDayStatemenData`,
      body,
      {headers}
    );
  }

  getCompanyList(token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  
    return this.http.post(`${this.apiUrl}/GetCompanyListData`, {}, { headers });
  }
  
  getBankAccountList(cieCode: number, bkiCurrency: string | null = null,token : string): Observable<any> {
    const body = {
      CieCode: cieCode,
      BkiCurrency: bkiCurrency
    };
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(
      `${this.apiUrl}/GetBankAccountListData`,
      body,
      { headers }
    );
  }  
}