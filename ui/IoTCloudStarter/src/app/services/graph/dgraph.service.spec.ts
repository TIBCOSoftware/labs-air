import { TestBed } from '@angular/core/testing';

import { DgraphService } from './dgraph.service';

describe('DgraphService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DgraphService = TestBed.get(DgraphService);
    expect(service).toBeTruthy();
  });
});
