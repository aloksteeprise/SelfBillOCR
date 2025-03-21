import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'; // ✅ Import schema
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RemittancePopupComponent } from './remittance-popup.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedModule } from '../shared/shared.module'; 
import { FormsModule } from '@angular/forms';  // ✅ Import FormsModule
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('RemittancePopupComponent', () => {
  let component: RemittancePopupComponent;
  let fixture: ComponentFixture<RemittancePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule, 
        SharedModule, 
        FormsModule  // ✅ Import FormsModule for ngForm support
      ],
      declarations: [RemittancePopupComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RemittancePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
