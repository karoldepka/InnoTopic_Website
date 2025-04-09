import { TestBed } from '@angular/core/testing';

import { MerchGenService } from './merch-gen.service';

describe('MerchGenService', () => {
  let service: MerchGenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MerchGenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
