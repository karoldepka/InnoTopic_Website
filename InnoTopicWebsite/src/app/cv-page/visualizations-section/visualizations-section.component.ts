import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AgenticAiComponent } from '../../learn/infographics/agentic-ai/agentic-ai.component';
import { ThreeDTextComponent } from '../../shared/threed-text/threed-text.component';
import { PrintService } from '../../TopicFriendsShared3/topics-core/print.service';
import { TopicTagComponent } from '../../topics-shared/topic-tag/topic-tag.component';

/**
 * CV section showcasing the site's dynamic, interactive visualizations, with a mini version of the
 * agentic AI diagram running live in it (the printed CV shows its URL instead).
 */
@Component({
  standalone: true,
  selector: 'app-visualizations-section',
  imports: [AgenticAiComponent, RouterLink, ThreeDTextComponent, TopicTagComponent],
  templateUrl: './visualizations-section.component.html',
  styleUrls: ['./visualizations-section.component.sass'],
})
export class VisualizationsSectionComponent {
  protected readonly isPrint = PrintService.isPrint
  /** For the printed CV, where links can't be clicked. */
  protected readonly origin = typeof location === 'undefined' ? '' : location.origin
  protected readonly agenticAiPath = '/learn/infographics/agentic-ai'
  protected readonly agenticAiTech = ['three.js', 'WebGL', 'TypeScript', 'Angular', 'Rust', 'WebAssembly']
}
