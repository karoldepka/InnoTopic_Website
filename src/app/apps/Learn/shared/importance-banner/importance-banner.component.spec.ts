import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ImportanceBannerComponent } from './importance-banner.component';

describe('ImportanceBannerComponent', () => {
  let component: ImportanceBannerComponent;
  let fixture: ComponentFixture<ImportanceBannerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ImportanceBannerComponent]
}).compileComponents();

    fixture = TestBed.createComponent(ImportanceBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
