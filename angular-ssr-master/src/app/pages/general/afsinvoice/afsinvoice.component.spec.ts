import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfsinvoiceComponent } from './afsinvoice.component';

describe('AfsinvoiceComponent', () => {
  let component: AfsinvoiceComponent;
  let fixture: ComponentFixture<AfsinvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfsinvoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfsinvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
