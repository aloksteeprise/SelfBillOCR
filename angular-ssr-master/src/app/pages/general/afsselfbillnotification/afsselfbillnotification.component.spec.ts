import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AfsselfbillnotificationComponent } from './afsselfbillnotification.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'; 
import { provideHttpClient } from '@angular/common/http'; 
import { NotificationPopupService } from '../notification-popup/notification-popup.service';  
import { ActivatedRoute } from '@angular/router'; 
import { of } from 'rxjs'; 
import { SharedModule } from '../shared/shared.module'; // ✅ Import SharedModule

describe('AfsselfbillnotificationComponent', () => {
  let component: AfsselfbillnotificationComponent;
  let fixture: ComponentFixture<AfsselfbillnotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,  
        SharedModule, // ✅ Add SharedModule to fix 'app-notification-popup' error
      ],
      declarations: [AfsselfbillnotificationComponent],  
      providers: [
        provideHttpClient(),  
        { 
          provide: ActivatedRoute, 
          useValue: { queryParams: of({ token: 'dummyToken' }) }  
        },
        { provide: MatDialogRef, useValue: {} }, 
        { provide: MAT_DIALOG_DATA, useValue: {} }, 
        NotificationPopupService 
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfsselfbillnotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();  
  });

  it('should create', () => {
    expect(component).toBeTruthy();  
  });
});
