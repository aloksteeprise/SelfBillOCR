import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemittanceAllocationComponent } from './remittance-allocation.component';

describe('RemittanceAllocationComponent', () => {
  let component: RemittanceAllocationComponent;
  let fixture: ComponentFixture<RemittanceAllocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemittanceAllocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemittanceAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
