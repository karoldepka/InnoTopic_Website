import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { TopicTagComponent } from '../../topics-shared/topic-tag/topic-tag.component';
import '@innotopic/theme-ui';

/**
 * Thin wrapper around @innotopic/theme-ui's <theme-configurator> custom element - the color
 * pickers/shadow sliders live there (see the "retire NgRx" decision); this supplies the topic
 * tags shown in its live preview.
 */
@Component({
  selector: 'app-theme-config',
  standalone: true,
  imports: [HeaderComponent, TopicTagComponent],
  templateUrl: './theme-config.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ThemeConfigComponent {
}
