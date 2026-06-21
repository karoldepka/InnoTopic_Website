import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutAngularComponent } from './about-angular.component';

describe('AboutAngularComponent', () => {
  let component: AboutAngularComponent;
  let fixture: ComponentFixture<AboutAngularComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AboutAngularComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutAngularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
