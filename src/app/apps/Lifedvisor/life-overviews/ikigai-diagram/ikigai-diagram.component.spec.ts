import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IkigaiDiagramComponent } from './ikigai-diagram.component';

describe('IkigaiDiagramComponent', () => {
  let component: IkigaiDiagramComponent;
  let fixture: ComponentFixture<IkigaiDiagramComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IkigaiDiagramComponent]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IkigaiDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
