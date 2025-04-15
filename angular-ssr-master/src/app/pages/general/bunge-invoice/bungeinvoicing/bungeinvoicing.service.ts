import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginationResponse } from '../bungeinvoicing/bungeinvoicing.model';
import { environment } from '../../constant/api-constants'

@Injectable({
  providedIn: 'root',
})

export class BungeApiService {

  private apiUrl = environment.API_BASE_URL + 'OCRAI/GetAFSBungeInvoicingData';

  //private apiUrl = 'https://localhost:44337/api/OCRAI/GetAFSBungeInvoicingData';

  constructor(private http: HttpClient) {

    date: [null];
  }

  getInvoices(

    pageIndex: number,
    pageSize: number,
    SortColumn: string | null = null,
    SortDirection: string | null = null,
    name: string | null = null,
    invoiceno: string | null = null,
    startdate: string | null = null,
    enddate: string | null = null,
    CsmTeam: string,
    CtcCode : string,
    ConCode : string,
    InternalInvoiceType : string,
    Currency:string,
    token: string
  ): Observable<PaginationResponse<any>> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const body = {
      pageIndex,
      pageSize,
      SortColumn,
      SortDirection,
      name,
      invoiceno,
      startdate,
      enddate,
      CsmTeam,
      CtcCode,
      ConCode,
      InternalInvoiceType,
      Currency
    };

    console.log('Request Body:', body);

    return this.http.post<PaginationResponse<any>>(this.apiUrl, body, { headers });
  }

  generateInvoicePDF(invoiceID: number, isAdminorContractor: number, token: string): Observable<any> {
    const url = environment.API_UAT_Invoice_URL + 'api/Invoice/GenerateInvoicePDF';

    const body = {
      "invoiceID": invoiceID,
      "isAdminorContractor": isAdminorContractor,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(url, body, { headers });
  }
}
