import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { QuizIntervalsComponent } from './quiz-intervals.component';

describe('QuizIntervalsComponent', () => {
  let component: QuizIntervalsComponent;
  let fixture: ComponentFixture<QuizIntervalsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), QuizIntervalsComponent]
}).compileComponents();

    fixture = TestBed.createComponent(QuizIntervalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
