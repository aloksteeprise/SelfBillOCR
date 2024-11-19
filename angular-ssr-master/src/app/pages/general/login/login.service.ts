import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'https://wfmapi.accessfinancial.com/api/identity/token';
  constructor(private http: HttpClient) {}
  
  postData(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
