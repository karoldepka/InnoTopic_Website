import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CongratsQuizFinishedComponent } from './congrats-quiz-finished.component';

describe('CongratsQuizFinishedComponent', () => {
  let component: CongratsQuizFinishedComponent;
  let fixture: ComponentFixture<CongratsQuizFinishedComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), CongratsQuizFinishedComponent]
}).compileComponents();

    fixture = TestBed.createComponent(CongratsQuizFinishedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
