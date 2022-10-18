import { TestBed } from '@angular/core/testing';

import { SozoApiService } from './sozo-api.service';

describe('SozoApiService', () => {
  let service: SozoApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SozoApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
