import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicLogoComponent } from './topic-logo.component';

describe('TopicLogoComponent', () => {
  let component: TopicLogoComponent;
  let fixture: ComponentFixture<TopicLogoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      // TopicLogoComponent is standalone: belongs in imports, not declarations.
      imports: [ TopicLogoComponent ],
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

  it('forwards the topic input to the underlying <topic-logo> element', () => {
    component = fixture.componentInstance;
    fixture.componentRef.setInput('topic', 'Angular');
    fixture.detectChanges();

    const topicLogoEl = fixture.nativeElement.querySelector('topic-logo');
    expect(topicLogoEl.topic).toBe('Angular');
  });
});
