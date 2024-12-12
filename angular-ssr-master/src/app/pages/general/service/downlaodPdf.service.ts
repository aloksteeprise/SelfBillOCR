import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DownloadPdfService {
  constructor(private http: HttpClient) {}

  downloadPdf(fileUrl: string) {
    return this.http.get(fileUrl, { responseType: 'blob' });
  }
}