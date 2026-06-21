import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RatingCellComponent } from './rating-cell.component';

describe('RatingCellComponent', () => {
  let component: RatingCellComponent;
  let fixture: ComponentFixture<RatingCellComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), RatingCellComponent]
}).compileComponents();

    fixture = TestBed.createComponent(RatingCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
