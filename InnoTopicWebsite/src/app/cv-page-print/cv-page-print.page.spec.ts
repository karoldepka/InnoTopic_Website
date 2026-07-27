import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { CvPagePrintPage } from './cv-page-print.page';

describe('CvPagePrintPage', () => {
  let component: CvPagePrintPage;
  let fixture: ComponentFixture<CvPagePrintPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CvPagePrintPage],
      // app-three-d-text (rendered via CvPageModule1's cv-page template) injects Store<{themeConfig}>.
      providers: [provideMockStore()],
    }).compileComponents();

    fixture = TestBed.createComponent(CvPagePrintPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
