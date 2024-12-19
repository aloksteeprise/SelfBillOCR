import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RemittancenotificationComponent } from './remittancenotification.component';
import { remittancenotificationRoute } from './remittancenotification-routing.module';
import { FormsModule } from '@angular/forms';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    remittancenotificationRoute,  
    FormsModule,
    NgxImageZoomModule,
    SharedModule
  ],
  exports: [
    RemittancenotificationComponent  
  ],
  declarations: [
    RemittancenotificationComponent,
     
  ],
  providers: [],
})
export class RemittanceNotificationModule { }  
