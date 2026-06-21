import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { Logo3dComponent } from './logo3d.component';

describe('Logo3dComponent', () => {
  let component: Logo3dComponent;
  let fixture: ComponentFixture<Logo3dComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ Logo3dComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Logo3dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
