import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalDataComponent } from './personal-data.component';

describe('PersonalDataComponent', () => {
  let component: PersonalDataComponent;
  let fixture: ComponentFixture<PersonalDataComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      // PersonalDataComponent is standalone: belongs in imports, not declarations.
      imports: [ PersonalDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
