import { TestBed } from '@angular/core/testing';

import { EdgeService } from './edge.service';

describe('EdgeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EdgeService = TestBed.get(EdgeService);
    expect(service).toBeTruthy();
  });
});
