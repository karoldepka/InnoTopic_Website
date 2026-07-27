import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NaturalLanguagesComponent } from './natural-languages.component';

describe('NaturalLanguagesComponent', () => {
  let component: NaturalLanguagesComponent;
  let fixture: ComponentFixture<NaturalLanguagesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      // NaturalLanguagesComponent is standalone: belongs in imports, not declarations.
      imports: [NaturalLanguagesComponent, IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NaturalLanguagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
