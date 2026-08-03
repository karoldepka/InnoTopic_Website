import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TestVirtualScrollPage } from './test-virtual-scroll.page';

describe('TestVirtualScrollPage', () => {
  let component: TestVirtualScrollPage;
  let fixture: ComponentFixture<TestVirtualScrollPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), TestVirtualScrollPage]
}).compileComponents();

    fixture = TestBed.createComponent(TestVirtualScrollPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
