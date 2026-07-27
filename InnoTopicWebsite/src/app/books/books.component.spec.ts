import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { provideMockStore } from '@ngrx/store/testing';

import { BooksComponent } from './books.component';

describe('BooksComponent', () => {
  let component: BooksComponent;
  let fixture: ComponentFixture<BooksComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      // BooksComponent is standalone: belongs in imports, not declarations.
      imports: [BooksComponent, IonicModule.forRoot()],
      // app-three-d-text (rendered in this component's template) injects Store<{themeConfig}>.
      providers: [provideMockStore()],
    }).compileComponents();

    fixture = TestBed.createComponent(BooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
