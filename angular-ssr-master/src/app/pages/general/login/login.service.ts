import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../constant/api-constants'

@Injectable({
  providedIn: 'root'
})


export class LoginService {
  private apiUrl = environment.API_BASE_URL+'identity/token/OcrLogin';
  


  constructor(private http: HttpClient) {
    // console.log(this.apiUrl);
   }

  postData(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
