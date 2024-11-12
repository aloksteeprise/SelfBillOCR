import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from './invoice';
import { InvoiceRequest } from './invoiceRequest';



@Injectable({
    providedIn: 'root'
 })

 
 export class InvoiceService {

  private apiUrl = 'https://wfmapi.accessfinancial.com/api/Compliance/GetAllComplDocList';
  constructor(private http: HttpClient) { }

    
    getAllContractorInvoices(): Observable<Invoice[]> {
      debugger;
      const headers = new HttpHeaders({
        'Accept': '*/*',
        'Content-Type': 'application/json'
      });
  
      return this.http.get<Invoice[]>(this.apiUrl, { headers });
    }
 } 