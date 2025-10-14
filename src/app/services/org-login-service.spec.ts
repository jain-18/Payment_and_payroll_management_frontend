import { TestBed } from '@angular/core/testing';

import { OrgLoginService } from './org-login-service';

describe('OrgLoginService', () => {
  let service: OrgLoginService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrgLoginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
