import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SloganComponent } from './slogan.component';

describe('SloganComponent', () => {
  let component: SloganComponent;
  let fixture: ComponentFixture<SloganComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), SloganComponent]
}).compileComponents();

    fixture = TestBed.createComponent(SloganComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
