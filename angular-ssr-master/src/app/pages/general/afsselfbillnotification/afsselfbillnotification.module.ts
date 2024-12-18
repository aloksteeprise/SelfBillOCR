import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AfsselfbillnotificationComponent } from './afsselfbillnotification.component';
import { afsselfbillnotificationRoute } from './afsselfbillnotification-routing.module';
import { FormsModule } from '@angular/forms';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  imports: [
    CommonModule,
    afsselfbillnotificationRoute,  
    FormsModule,
    NgxImageZoomModule
  ],
  exports: [
    AfsselfbillnotificationComponent  
  ],
  declarations: [
    AfsselfbillnotificationComponent,
     
  ],
  providers: [],
})
export class AfsSelfBillNotificationModule { }  
