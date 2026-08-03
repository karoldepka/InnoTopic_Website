import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ImportanceComponent } from './importance.component';

describe('ImportanceComponent', () => {
  let component: ImportanceComponent;
  let fixture: ComponentFixture<ImportanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ImportanceComponent]
}).compileComponents();

    fixture = TestBed.createComponent(ImportanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
