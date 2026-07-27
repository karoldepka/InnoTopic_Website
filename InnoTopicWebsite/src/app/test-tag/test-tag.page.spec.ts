import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TestTagPage } from './test-tag.page';

describe('TestTagPage', () => {
  let component: TestTagPage;
  let fixture: ComponentFixture<TestTagPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(TestTagPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
