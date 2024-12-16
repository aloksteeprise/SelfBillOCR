import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemittancePopupComponent } from './remittance-popup.component';

describe('RemittancePopupComponent', () => {
  let component: RemittancePopupComponent;
  let fixture: ComponentFixture<RemittancePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemittancePopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemittancePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
