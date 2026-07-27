import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyLogoComponent } from './company-logo.component';

describe('CompanyLogoComponent', () => {
  let component: CompanyLogoComponent;
  let fixture: ComponentFixture<CompanyLogoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      // CompanyLogoComponent is standalone: belongs in imports, not declarations.
      imports: [ CompanyLogoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyLogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
