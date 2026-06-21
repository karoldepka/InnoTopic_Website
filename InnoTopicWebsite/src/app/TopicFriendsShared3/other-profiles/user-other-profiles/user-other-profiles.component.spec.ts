import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserOtherProfilesComponent } from './user-other-profiles.component';

describe('UserOtherProfilesComponent', () => {
  let component: UserOtherProfilesComponent;
  let fixture: ComponentFixture<UserOtherProfilesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UserOtherProfilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserOtherProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  xit('should be created', () => {
    expect(component).toBeTruthy();
  });
});
