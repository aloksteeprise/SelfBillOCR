import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfsInvoicesComponent } from './afsinvoices.component';

describe('AfsinvoicesComponent', () => {
  let component: AfsInvoicesComponent;
  let fixture: ComponentFixture<AfsInvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfsInvoicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfsInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
