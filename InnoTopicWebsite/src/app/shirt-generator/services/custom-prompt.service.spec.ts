import { TestBed } from '@angular/core/testing';

import { CustomPromptService } from './custom-prompt.service';

describe('CustomPromptService', () => {
  let service: CustomPromptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomPromptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
