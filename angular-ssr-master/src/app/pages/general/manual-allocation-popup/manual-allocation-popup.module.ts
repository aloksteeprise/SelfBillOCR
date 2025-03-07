
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManualAllocationPopupComponent } from './manual-allocation-popup.component';
import { FormsModule } from '@angular/forms';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgxImageZoomModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    SharedModule
  ],
  declarations: [
    ManualAllocationPopupComponent
  ],
  exports: [
    ManualAllocationPopupComponent
  ]
})
export class ManualAllocationPopupModule { }