import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SideLabelComponent } from './side-label.component';

describe('SideLabelComponent', () => {
  let component: SideLabelComponent;
  let fixture: ComponentFixture<SideLabelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), SideLabelComponent]
}).compileComponents();

    fixture = TestBed.createComponent(SideLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
