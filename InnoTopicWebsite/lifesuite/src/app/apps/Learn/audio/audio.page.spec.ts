import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AudioPage } from './audio.page';

describe('AudioPage', () => {
  let component: AudioPage;
  let fixture: ComponentFixture<AudioPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), AudioPage]
}).compileComponents();

    fixture = TestBed.createComponent(AudioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
