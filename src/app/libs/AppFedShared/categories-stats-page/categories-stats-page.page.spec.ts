import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CategoriesStatsPagePage } from './categories-stats-page.page';

describe('CategoriesStatsPagePage', () => {
  let component: CategoriesStatsPagePage;
  let fixture: ComponentFixture<CategoriesStatsPagePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), CategoriesStatsPagePage]
}).compileComponents();

    fixture = TestBed.createComponent(CategoriesStatsPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
