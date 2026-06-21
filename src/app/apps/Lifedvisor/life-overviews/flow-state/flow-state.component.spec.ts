import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FlowStateComponent } from './flow-state.component';

describe('FlowStateComponent', () => {
  let component: FlowStateComponent;
  let fixture: ComponentFixture<FlowStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), FlowStateComponent]
}).compileComponents();

    fixture = TestBed.createComponent(FlowStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
