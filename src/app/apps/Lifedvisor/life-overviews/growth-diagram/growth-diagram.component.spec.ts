import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GrowthDiagramComponent } from './growth-diagram.component';

describe('GrowthDiagramComponent', () => {
  let component: GrowthDiagramComponent;
  let fixture: ComponentFixture<GrowthDiagramComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [GrowthDiagramComponent]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GrowthDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
