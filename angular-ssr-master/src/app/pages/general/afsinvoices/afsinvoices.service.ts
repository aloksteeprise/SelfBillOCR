import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginationResponse } from '../afsinvoices/afsinvoices.model';
import { environment } from '../constant/api-constants'

@Injectable({
  providedIn: 'root',
})

export class ApiService {

  private apiUrl = environment.API_BASE_URL + 'OCRAI/GetAFSExpensesData';

  //private apiUrl = 'https://localhost:44337/api/OCRAI/GetAFSExpensesData';

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
    IsValidatedRecord: boolean,
    IsSelfBill: boolean,  
    CsmTeam: string,
    IsCompleteRecord:boolean,
    token: string
  ): Observable<PaginationResponse<any>> {
    // Set authorization and content-type headers
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    
  //  console.log(headers,"akash 2nd console")

    // Construct the request body
    const body = {
      pageIndex,
      pageSize,
      SortColumn,
      SortDirection,
      name,
      invoiceno,
      startdate,
      enddate,
      IsValidatedRecord,
      IsSelfBill,
      CsmTeam,
      IsCompleteRecord
    };

    console.log('Request Body:', body); // Log the request body for debugging

    // Make the POST request
    return this.http.post<PaginationResponse<any>>(this.apiUrl, body, { headers });
  }

  generateInvoicePDF(invoiceID: number, isAdminorContractor: number, token: string): Observable<any> {
    const url = environment.API_UAT_Invoice_URL + 'api/Invoice/GenerateInvoicePDF';
    //const url = environment.API_Live_Invoice_URL + 'api/Invoice/GenerateInvoicePDF';

    // Construct the request body
    const body = {
      "invoiceID": invoiceID,
      "isAdminorContractor":isAdminorContractor,
    };

    const headers = new HttpHeaders({
      //Authorization: `Bearer ${token}`, //for UAT not accepting the Bearer token but live have
      'Content-Type': 'application/json'
    });
  
    // Return the API response
    return this.http.post<any>(url, body, { headers });
  }
}
