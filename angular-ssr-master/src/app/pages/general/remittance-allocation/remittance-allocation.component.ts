import { Component, HostListener, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from '../constant/api-constants';
import { NotificationPopupService } from '../notification-popup/notification-popup.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-remittance-allocation',
  templateUrl: './remittance-allocation.component.html',
  styleUrls: ['./remittance-allocation.component.css']
})
export class RemittanceAllocationComponent implements OnInit {
  displayedColumns: string[] = [
    'allocationType', 'item', 'amountToAllocate', 'agencyCommission', 
    'ourFee', 'contractorDue', 'vat', 'dueByAg', 'bankCharges', 
    'taxWithheld', 'factoring', 'pendingLeftDue'
  ];

  // Agency: string | null = null;
  // Agencyarr: { agecode: string; agedesc: string }[] = [];
  Agency: string | null = null;
  Agencyarr: any[] = [];
  dataSource: any[] = [];
  CsmTeam: any | null = null;
  pageSize: number = 20;
  PageNumber: number = 1; // Start from Page 1
  SearchTerm: string = '';
  // Agencyarr: any[] = [];
  isLoading: boolean = false; // Prevent duplicate API calls
  showDropdown: boolean = false;
  filteredAgencies!: Observable<{ agecode: string; agedesc: string }[]>;
  agencyControl: FormControl = new FormControl('');


  constructor(
    private dialogRef: MatDialogRef<RemittanceAllocationComponent>,
    public notificationService: NotificationPopupService,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.filteredAgencies = this.agencyControl.valueChanges.pipe(
      debounceTime(300), // Delay API call while typing
      distinctUntilChanged(), // Only call API if value changed
      switchMap(value => this.fetchAgencyList(value)) // Call API
    );
  }


  fetchAgencyList(searchTerm: string): Observable<{ agecode: string; agedesc: string }[]> {
    if (!searchTerm.trim()) return of([]);
  
    const apiUrl = `${environment.API_BASE_URL}OCRAI/GetAgencyListData`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
    const body = {
      SearchTerm: searchTerm,
      PageNumber: this.PageNumber,
      PageSize: this.pageSize,
    };
  
    return this.http.post<any>(apiUrl, body, { headers }).pipe(
      map(data => {
        console.log('API Response:', data); // Debugging API Response
        return Array.isArray(data?.data?.agencyList) ? data.data.agencyList : [];
      })
    );
  }
  

  onSelectAgency(selectedAgency: any) {
    console.log('Selected Agency:', selectedAgency);
  }

  displayAgency(agency?: { agecode: string; agedesc: string }): string {
    return agency ? agency.agedesc : '';
  }
  



  closeDialog(): void {
    this.dialogRef.close();
  }
}
