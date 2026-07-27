import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillLevelIconComponent } from './skill-level-icon.component';

describe('SkillLevelIconComponent', () => {
  let component: SkillLevelIconComponent;
  let fixture: ComponentFixture<SkillLevelIconComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      // SkillLevelIconComponent is standalone: belongs in imports, not declarations.
      imports: [ SkillLevelIconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillLevelIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
