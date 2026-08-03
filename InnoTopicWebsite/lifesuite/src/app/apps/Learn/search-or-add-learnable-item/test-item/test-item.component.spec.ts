import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TestItemComponent } from './test-item.component';

describe('TestItemComponent', () => {
  let component: TestItemComponent;
  let fixture: ComponentFixture<TestItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), TestItemComponent]
}).compileComponents();

    fixture = TestBed.createComponent(TestItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
