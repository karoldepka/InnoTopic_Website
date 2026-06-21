import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ChooserComponent } from './chooser.component';

describe('ChooserComponent', () => {
  let component: ChooserComponent;
  let fixture: ComponentFixture<ChooserComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ChooserComponent]
}).compileComponents();

    fixture = TestBed.createComponent(ChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
