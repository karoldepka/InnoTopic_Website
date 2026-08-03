import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OccupationsPage } from './occupations.page';

describe('OccupationsPage', () => {
  let component: OccupationsPage;
  let fixture: ComponentFixture<OccupationsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), OccupationsPage]
}).compileComponents();

    fixture = TestBed.createComponent(OccupationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
