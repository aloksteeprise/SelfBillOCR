import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualAllocationPopupComponent } from './manual-allocation-popup.component';

describe('ManualAllocationPopupComponent', () => {
  let component: ManualAllocationPopupComponent;
  let fixture: ComponentFixture<ManualAllocationPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManualAllocationPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManualAllocationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
