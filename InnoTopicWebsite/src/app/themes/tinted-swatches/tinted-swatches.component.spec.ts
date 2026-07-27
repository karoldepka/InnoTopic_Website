import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TintedSwatchesComponent } from './tinted-swatches.component';

describe('TintedSwatchesComponent', () => {
  let component: TintedSwatchesComponent;
  let fixture: ComponentFixture<TintedSwatchesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      // TintedSwatchesComponent is standalone: belongs in imports, not declarations.
      imports: [TintedSwatchesComponent, IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TintedSwatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
