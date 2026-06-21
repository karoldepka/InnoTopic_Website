import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { QuizCategoriesPickerComponent } from './quiz-categories-picker.component';

describe('QuizCategoriesPickerComponent', () => {
  let component: QuizCategoriesPickerComponent;
  let fixture: ComponentFixture<QuizCategoriesPickerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), QuizCategoriesPickerComponent]
}).compileComponents();

    fixture = TestBed.createComponent(QuizCategoriesPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
