import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LearnStatsComponent } from './learn-stats.component';

describe('LearnStatsComponent', () => {
  let component: LearnStatsComponent;
  let fixture: ComponentFixture<LearnStatsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), LearnStatsComponent]
}).compileComponents();

    fixture = TestBed.createComponent(LearnStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
