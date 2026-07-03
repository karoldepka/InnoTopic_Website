import { ActivatedRoute } from '@angular/router';
import { TopicsGraphComponent } from './topics-graph.component';

describe('TopicsGraphComponent', () => {
  function createComponent() {
    const activatedRoute = {
      snapshot: {
        queryParams: {},
      },
    } as ActivatedRoute;

    return new TopicsGraphComponent(activatedRoute);
  }

  it('adds click hint to hover title', () => {
    const component = createComponent();

    expect(component.getTopicHoverTitle('Angular'))
      .toBe('Angular (tap or click to show more info)');
  });

  it('shows info for known topic', () => {
    const component = createComponent();

    component.showTopicInfo('Angular');

    expect(component.selectedTopicId).toBe('Angular');
    expect(component.selectedTopicInfo).toContain('Angular');
  });

  it('shows fallback for unknown topic', () => {
    const component = createComponent();

    component.showTopicInfo('Unknown Topic');

    expect(component.selectedTopicInfo).toBe('No extra info yet for Unknown Topic.');
  });
});
