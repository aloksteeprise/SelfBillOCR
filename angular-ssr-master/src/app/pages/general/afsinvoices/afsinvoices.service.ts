import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginationResponse } from '../afsinvoices/afsinvoices.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  //private apiUrl = 'https://localhost:44337/api/OCRAI/GetAFSExpensesData';
  private apiUrl = 'https://wfmapi.accessfinancial.com/api/OCRAI';
  constructor(private http: HttpClient) {}

  getInvoices(
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
      SortColumn,      // Add SortColumn to the request
      SortDirection,   // Add SortDirection to the request
      
    };

    console.log('Request Body:', body); // Log the request body for debugging

    // Make the POST request
    return this.http.post<PaginationResponse<any>>(this.apiUrl, body, { headers });
  }
}
