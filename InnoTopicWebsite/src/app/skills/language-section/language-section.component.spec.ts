import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { LanguageSectionComponent } from './language-section.component';

describe('LanguageSectionComponent', () => {
  let component: LanguageSectionComponent;
  let fixture: ComponentFixture<LanguageSectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      // LanguageSectionComponent is standalone: belongs in imports, not declarations.
      imports: [LanguageSectionComponent, IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(LanguageSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
