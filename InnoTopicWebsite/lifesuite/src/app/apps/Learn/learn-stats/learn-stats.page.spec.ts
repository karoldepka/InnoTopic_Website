import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LearnStatsPage } from './learn-stats.page';

describe('LearnStatsPage', () => {
  let component: LearnStatsPage;
  let fixture: ComponentFixture<LearnStatsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), LearnStatsPage]
}).compileComponents();

    fixture = TestBed.createComponent(LearnStatsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
