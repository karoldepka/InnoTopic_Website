import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MerchGenComponent } from './merch-gen.component';

describe('MerchGenComponent', () => {
  let component: MerchGenComponent;
  let fixture: ComponentFixture<MerchGenComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      // MerchGenComponent is standalone: belongs in imports, not declarations.
      imports: [MerchGenComponent, IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MerchGenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
