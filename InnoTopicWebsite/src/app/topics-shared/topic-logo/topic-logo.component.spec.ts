import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { TopicsService } from '../../TopicFriendsShared3/topics-core/topics.service';

import {
  defaultIconHeight,
  TopicLogoComponent,
} from './topic-logo.component';

describe('TopicLogoComponent', () => {
  let component: TopicLogoComponent;
  let fixture: ComponentFixture<TopicLogoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      // TopicLogoComponent is standalone: belongs in imports, not declarations.
      imports: [ TopicLogoComponent ],
      providers: [ TopicsService ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopicLogoComponent);
  });

  it('should create', () => {
    component = fixture.componentInstance;
    fixture.componentRef.setInput('topic', 'Angular');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should handle custom icon size', () => {
    component = fixture.componentInstance;
    // JUnit has an active (non-square) logoSize in topics-data.ts, unlike e.g. 'Nx' whose
    // logoSize is currently commented out there - use a topic that actually exercises this path.
    fixture.componentRef.setInput('topic', 'JUnit');
    fixture.detectChanges();

    expect(component.dimensions().width).toBeGreaterThan(defaultIconHeight);
    expect(component.dimensions().height).toBe(defaultIconHeight);
  });
});
