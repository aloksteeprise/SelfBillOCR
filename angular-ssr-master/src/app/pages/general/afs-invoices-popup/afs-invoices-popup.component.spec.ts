import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfsInvoicesPopupComponent } from './afs-invoices-popup.component';

describe('AfsInvoicesPopupComponent', () => {
  let component: AfsInvoicesPopupComponent;
  let fixture: ComponentFixture<AfsInvoicesPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfsInvoicesPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfsInvoicesPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
