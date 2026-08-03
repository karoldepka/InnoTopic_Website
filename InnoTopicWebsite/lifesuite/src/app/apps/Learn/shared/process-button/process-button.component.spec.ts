import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProcessButtonComponent } from './process-button.component';

describe('ProcessButtonComponent', () => {
  let component: ProcessButtonComponent;
  let fixture: ComponentFixture<ProcessButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ProcessButtonComponent]
}).compileComponents();

    fixture = TestBed.createComponent(ProcessButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
