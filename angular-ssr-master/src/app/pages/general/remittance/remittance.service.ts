import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from './remittance';
import { InvoiceRequest } from './invoiceRequest';
import { environment } from '../constant/api-constants';



@Injectable({
    providedIn: 'root'
 })

 
 export class InvoiceService {
  

  private apiUrl = environment.API_BASE_URL + 'OCRAI/GetPDFReadRemittanceList';
  constructor(private http: HttpClient) { }

    
    getAllContractorInvoices(): Observable<Invoice[]> {
      debugger;
      const headers = new HttpHeaders({
        'Accept': '*/*',
        'Content-Type': 'application/json'
      });
  
      return this.http.post<Invoice[]>(this.apiUrl, { headers });
    }
 } 