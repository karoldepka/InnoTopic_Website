import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MindfulnessPage } from './mindfulness.page';

describe('MindfulnessPage', () => {
  let component: MindfulnessPage;
  let fixture: ComponentFixture<MindfulnessPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), MindfulnessPage]
}).compileComponents();

    fixture = TestBed.createComponent(MindfulnessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
