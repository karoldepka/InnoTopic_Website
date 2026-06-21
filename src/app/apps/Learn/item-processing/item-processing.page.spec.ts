import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ItemProcessingPage } from './item-processing.page';

describe('ItemProcessingPage', () => {
  let component: ItemProcessingPage;
  let fixture: ComponentFixture<ItemProcessingPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), ItemProcessingPage]
}).compileComponents();

    fixture = TestBed.createComponent(ItemProcessingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
