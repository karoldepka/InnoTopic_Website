import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MerchGenPage } from './merch-gen.page';

describe('MerchGenPage', () => {
  let component: MerchGenPage;
  let fixture: ComponentFixture<MerchGenPage>;

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(MerchGenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
