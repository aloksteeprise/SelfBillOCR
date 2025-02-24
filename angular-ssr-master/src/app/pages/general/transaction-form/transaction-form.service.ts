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
    Company: number | null = null,
    BankAccount: string | null = null,
    TypesOfMovements: number | null = null,
    Money: number | null = null,
    BankDateFrom: Date | null = null,  
    BankDateTo: Date | null = null,   
    Currency: string | null = null,
    BatchType: string | null = null
  ): Observable<PaginationResponse<any>> {
  


    const body = {
      Company,
      BankAccount,
      TypesOfMovements,
      Money,
      BankDateFrom,
      BankDateTo, 
      Currency,
      BatchType
    };
    

    console.log('Request Body:', body); // Log the request body for debugging

    return this.http.post<PaginationResponse<any>>(this.apiUrl, body);
  }
}
