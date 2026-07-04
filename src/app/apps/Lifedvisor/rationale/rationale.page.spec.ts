import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RationalePage } from './rationale.page';

describe('RationalePage', () => {
  let component: RationalePage;
  let fixture: ComponentFixture<RationalePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), RationalePage]
}).compileComponents();

    fixture = TestBed.createComponent(RationalePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
