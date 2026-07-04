import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RationaleComponent } from './rationale.component';

describe('RationaleComponent', () => {
  let component: RationaleComponent;
  let fixture: ComponentFixture<RationaleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [RationaleComponent]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RationaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
