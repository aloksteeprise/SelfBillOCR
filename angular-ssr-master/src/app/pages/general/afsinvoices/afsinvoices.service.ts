import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginationResponse } from '../afsinvoices/afsinvoices.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'https://localhost:44337/api/Invoice/GetAllContractorInvoice';

  constructor(private http: HttpClient) {}

  getInvoices(
    contractCode: number,
  invFromDate: Date | null,
  invToDate: Date | null,
  contractorCode: string,
  pageIndex: number,
  pageSize: number,
  token: string
  ): Observable<PaginationResponse<any>> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
debugger;
    // Construct HttpParams
    let params = new HttpParams()
      //.set('ContractorCode', contractorCode)
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());

    if (contractCode !== null) {
      params = params.set('contractCode', contractCode);
    }
    if (invFromDate) {
      console.log('Serialized invFromDate:', invFromDate.toISOString()); 
      params = params.set('invFromDate', invFromDate.toISOString()); // ISO 8601 format
    }
    if (invToDate) {
      console.log('Serialized invToDate:', invToDate.toISOString()); 
      params = params.set('invToDate', invToDate.toISOString()); // ISO 8601 format
    }
    if (contractorCode) {
      console.log('ContractorCode:', contractorCode); 
      params = params.set('ContractorCode', contractorCode.toString()); // ISO 8601 format
    }
    console.log('Final HTTP Params:', params.toString()); 
    //return this.http.post<PaginationResponse<any>>(this.apiUrl, {}, { headers, params });
    return this.http.post<PaginationResponse<any>>(
      this.apiUrl,
      { // Pass parameters in the request body
        contractCode,
        invFromDate: invFromDate ? invFromDate.toISOString() : null,
        invToDate: invToDate ? invToDate.toISOString() : null,
        contractorCode,
        pageIndex,
        pageSize,
      },
      { headers }
    );
    
  }
}
