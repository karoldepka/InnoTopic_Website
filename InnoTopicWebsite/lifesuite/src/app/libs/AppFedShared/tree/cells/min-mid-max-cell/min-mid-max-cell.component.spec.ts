import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MinMidMaxCellComponent } from './min-mid-max-cell.component';

describe('MinMidMaxCellComponent', () => {
  let component: MinMidMaxCellComponent;
  let fixture: ComponentFixture<MinMidMaxCellComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), MinMidMaxCellComponent]
}).compileComponents();

    fixture = TestBed.createComponent(MinMidMaxCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
