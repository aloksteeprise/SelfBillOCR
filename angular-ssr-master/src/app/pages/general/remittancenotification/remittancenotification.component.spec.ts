import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemittancenotificationComponent } from './remittancenotification.component';

describe('RemittancenotificationComponent', () => {
  let component: RemittancenotificationComponent;
  let fixture: ComponentFixture<RemittancenotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemittancenotificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemittancenotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
