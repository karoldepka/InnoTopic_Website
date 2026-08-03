import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RadicalCandorComponent } from './radical-candor.component';

describe('RadicalCandorComponent', () => {
  let component: RadicalCandorComponent;
  let fixture: ComponentFixture<RadicalCandorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), RadicalCandorComponent]
}).compileComponents();

    fixture = TestBed.createComponent(RadicalCandorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
