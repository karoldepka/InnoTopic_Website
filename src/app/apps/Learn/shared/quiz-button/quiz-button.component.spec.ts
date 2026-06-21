import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { QuizButtonComponent } from './quiz-button.component';

describe('QuizButtonComponent', () => {
  let component: QuizButtonComponent;
  let fixture: ComponentFixture<QuizButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), QuizButtonComponent]
}).compileComponents();

    fixture = TestBed.createComponent(QuizButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
