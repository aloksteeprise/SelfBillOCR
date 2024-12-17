import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmationPopComponent } from './confirmation-pop.component';

describe('ConfirmationPopComponent', () => {
  let component: ConfirmationPopComponent;
  let fixture: ComponentFixture<ConfirmationPopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationPopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmationPopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
