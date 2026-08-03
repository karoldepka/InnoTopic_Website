import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JournalTextFieldsViewComponent } from './journal-text-fields-view.component';

describe('JournalTextFieldsViewComponent', () => {
  let component: JournalTextFieldsViewComponent;
  let fixture: ComponentFixture<JournalTextFieldsViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), JournalTextFieldsViewComponent]
}).compileComponents();

    fixture = TestBed.createComponent(JournalTextFieldsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
