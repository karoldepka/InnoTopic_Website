import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GeoLocComponent } from './geo-loc.component';

describe('GeoLocComponent', () => {
  let component: GeoLocComponent;
  let fixture: ComponentFixture<GeoLocComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), GeoLocComponent]
}).compileComponents();

    fixture = TestBed.createComponent(GeoLocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
