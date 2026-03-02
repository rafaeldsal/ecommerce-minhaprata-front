import { TestBed } from '@angular/core/testing';

import { StateResetService } from './state-reset.service';

describe('StateResetService', () => {
  let service: StateResetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StateResetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
