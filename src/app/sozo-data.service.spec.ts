import { TestBed } from '@angular/core/testing';

import { SozoDataService } from './sozo-data.service';

describe('SozoDataService', () => {
  let service: SozoDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SozoDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
