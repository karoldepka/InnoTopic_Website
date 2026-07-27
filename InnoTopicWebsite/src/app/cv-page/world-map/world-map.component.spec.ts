import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldMapComponent } from './world-map.component';

describe('WorldMapComponent', () => {
  let component: WorldMapComponent;
  let fixture: ComponentFixture<WorldMapComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      // WorldMapComponent is standalone: belongs in imports, not declarations.
      imports: [ WorldMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorldMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
