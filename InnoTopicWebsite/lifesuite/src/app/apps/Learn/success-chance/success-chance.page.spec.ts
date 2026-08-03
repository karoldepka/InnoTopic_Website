import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SuccessChancePage } from './success-chance.page';

describe('SuccessChancePage', () => {
  let component: SuccessChancePage;
  let fixture: ComponentFixture<SuccessChancePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), SuccessChancePage]
}).compileComponents();

    fixture = TestBed.createComponent(SuccessChancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
