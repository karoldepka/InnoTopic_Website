import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LifedvisorPage } from './lifedvisor.page';

describe('LifedvisorPage', () => {
  let component: LifedvisorPage;
  let fixture: ComponentFixture<LifedvisorPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), LifedvisorPage]
}).compileComponents();

    fixture = TestBed.createComponent(LifedvisorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
