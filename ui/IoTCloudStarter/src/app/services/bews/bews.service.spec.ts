import { TestBed } from '@angular/core/testing';

import { BewsService } from './bews.service';

describe('BewsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BewsService = TestBed.get(BewsService);
    expect(service).toBeTruthy();
  });
});
