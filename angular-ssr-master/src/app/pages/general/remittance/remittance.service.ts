import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from './remittance';
import { InvoiceRequest } from './invoiceRequest';
import { environment } from '../constant/api-constants';
import { PaginationResponse } from './remittance';


@Injectable({
    providedIn: 'root'
 })

 

 export class InvoiceService {
  
  private apiUrl = environment.API_BASE_URL + 'OCRAI/GetPDFReadRemittanceList';

  //private apiUrl = 'https://localhost:44337/api/OCRAI/GetAFSExpensesData';

  constructor(private http: HttpClient) {

    date: [null];
  }

  getRemittanceRecord(
    pageIndex: number,
    pageSize: number,
    SortColumn: string | null = null,
    SortDirection: string | null = null,
    token: string
  ): Observable<PaginationResponse<any>> {
    // Set authorization and content-type headers
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    // Construct the request body
    const body = {
      pageIndex,
      pageSize,
      SortColumn,      
      SortDirection,
    };

    console.log('Request Body:', body); // Log the request body for debugging

    // Make the POST request
    return this.http.post<PaginationResponse<any>>(this.apiUrl, body, { headers });
  }
  //private apiUrl = environment.API_BASE_URL + 'OCRAI/GetPDFReadRemittanceList';
  //constructor(private http: HttpClient) { }

    
    // getAllContractorInvoices(): Observable<Invoice[]> {
    //   const headers = new HttpHeaders({
    //     'Accept': '*/*',
    //     'Content-Type': 'application/json'
    //   });
  
    //   return this.http.post<Invoice[]>(this.apiUrl, { headers });
    // }
 } 