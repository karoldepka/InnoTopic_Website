import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PreviewComponent } from './preview.component';
import { TopicLogoComponent } from '../../../topics-shared/topic-logo/topic-logo.component';

describe('PreviewComponent', () => {
  let component: PreviewComponent;
  let fixture: ComponentFixture<PreviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewComponent ],
      // TopicLogoComponent (used in PreviewComponent's template) is standalone: belongs in imports.
      imports: [IonicModule.forRoot(), TopicLogoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
