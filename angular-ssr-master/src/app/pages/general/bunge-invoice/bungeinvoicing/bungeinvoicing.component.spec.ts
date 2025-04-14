import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BungeinvoicingComponent } from './bungeinvoicing.component';

describe('BungeinvoicingComponent', () => {
  let component: BungeinvoicingComponent;
  let fixture: ComponentFixture<BungeinvoicingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BungeinvoicingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BungeinvoicingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
