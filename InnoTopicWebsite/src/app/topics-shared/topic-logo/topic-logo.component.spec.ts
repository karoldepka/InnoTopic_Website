import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureFlagsService } from '../../shared/feature-flags/feature-flags.service';
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

  it('renders the resolved topic logo as an image', () => {
    // Without recoloring the original logo URL is shown, and no Wasm worker is started.
    TestBed.inject(FeatureFlagsService).dynamicLogoColorization.set(false);
    fixture.componentRef.setInput('topic', 'Angular');
    fixture.detectChanges();

    const image: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(image.alt).toBe('Angular');
    expect(image.getAttribute('src')).toContain('angular');
  });
});
