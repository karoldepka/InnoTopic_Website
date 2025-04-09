import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MerchGenPage } from './merch-gen.page';

describe('MerchGenPage', () => {
  let component: MerchGenPage;
  let fixture: ComponentFixture<MerchGenPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MerchGenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
