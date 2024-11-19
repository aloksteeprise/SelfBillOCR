import { TestBed } from '@angular/core/testing';

import { ApiService } from './afsinvoices.service';

describe('AfsinvoicesService', () => {
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
