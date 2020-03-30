import { TestBed } from '@angular/core/testing';

import { FlogoDeployService } from './flogo-deploy.service';

describe('FlogoDeployService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FlogoDeployService = TestBed.get(FlogoDeployService);
    expect(service).toBeTruthy();
  });
});
