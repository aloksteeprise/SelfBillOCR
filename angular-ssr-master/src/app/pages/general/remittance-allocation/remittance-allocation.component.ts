import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-remittance-allocation',
  templateUrl: './remittance-allocation.component.html',
  styleUrls: ['./remittance-allocation.component.css'] // Fixed property name
})
export class RemittanceAllocationComponent {
  displayedColumns: string[] = [
    'allocationType', 'item', 'amountToAllocate', 'agencyCommission', 
    'ourFee', 'contractorDue', 'vat', 'dueByAg', 'bankCharges', 
    'taxWithheld', 'factoring', 'pendingLeftDue'
  ];

  dataSource: any[] = []; // Empty array to avoid errors
  constructor(
    private dialogRef: MatDialogRef<RemittanceAllocationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // Inject MAT_DIALOG_DATA if needed
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }
}
