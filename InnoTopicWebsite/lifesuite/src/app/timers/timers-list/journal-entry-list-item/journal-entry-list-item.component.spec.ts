import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JournalEntryListItemComponent } from './journal-entry-list-item.component';

describe('JournalEntryListItemComponent', () => {
  let component: JournalEntryListItemComponent;
  let fixture: ComponentFixture<JournalEntryListItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), JournalEntryListItemComponent]
}).compileComponents();

    fixture = TestBed.createComponent(JournalEntryListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
