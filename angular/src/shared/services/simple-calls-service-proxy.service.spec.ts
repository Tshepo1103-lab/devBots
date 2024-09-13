import { TestBed } from '@angular/core/testing';

import { SimpleCallsServiceProxy } from './simple-calls-service-proxy.service';

describe('SimpleCallsServiceProxy', () => {
  let service: SimpleCallsServiceProxy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SimpleCallsServiceProxy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
