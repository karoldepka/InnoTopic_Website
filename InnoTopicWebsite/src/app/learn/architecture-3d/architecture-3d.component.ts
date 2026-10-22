import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  NgZone,
  OnDestroy,
  untracked,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TopicSearchService } from '../../topics-shared/topic-search.service';
import { Architecture3dId, Architecture3dView, mountArchitecture3d } from './architecture-3d.engine';

export const ARCHITECTURE_3D_ROUTES: Record<Architecture3dId, string> = {
  rag: '/learn/architecture-3d/rag',
  agentic: '/learn/architecture-3d/agentic',
};

/** Texts of each view's header (from the standalone Vis/index.html page). */
export const ARCHITECTURE_3D_PAGES: Record<Architecture3dId, {
  tab: string, title: string, accent: string, heading: string, intro: string, play: string, flows: string,
}> = {
  rag: {
    tab: 'RAG architecture', title: 'RAG Architecture · 3D', accent: 'RAG', heading: 'AI Application Architecture',
    intro: 'Documents are indexed ahead of time; each query retrieves the best context and feeds it to the LLM. Hover for a summary, click for details.',
    play: '▶ Play query', flows: 'Data flow',
  },
  agentic: {
    tab: 'Agentic AI', title: 'Agentic AI Architecture · 3D', accent: 'Agentic AI', heading: 'Components & Relationships',
    intro: 'An agent is an LLM in a loop: it observes its context, thinks, and acts through tools — with memory, sub-agents and guardrails around it. Hover for a summary, click for details.',
    play: '▶ Play agent run', flows: 'Relationships',
  },
};

/**
 * One 3D architecture view (see mountArchitecture3d), filling its host. The page's topic search also
 * highlights matching components (by name or technology) and dims the rest.
 */
@Directive()
abstract class Architecture3dComponentBase implements AfterViewInit, OnDestroy {
  protected abstract readonly vis: Architecture3dId;
  /** Mini version embedded in another page (e.g. the CV): compact header, no legend or view switch. */
  readonly compact = input(false);

  protected readonly views = (Object.keys(ARCHITECTURE_3D_PAGES) as Architecture3dId[])
    .map(id => ({ id, tab: ARCHITECTURE_3D_PAGES[id].tab, route: ARCHITECTURE_3D_ROUTES[id] }));
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  private readonly zone = inject(NgZone);
  private readonly router = inject(Router);
  private readonly search = inject(TopicSearchService);
  private view?: Architecture3dView;

  protected get page() {
    return ARCHITECTURE_3D_PAGES[this.vis];
  }

  constructor() {
    effect(() => {
      const test = this.search.matcher() ?? undefined; // invalid regex: no search
      this.view?.setSearch(test);
    });
  }

  ngAfterViewInit() {
    // The render loop and pointer handlers need no change detection.
    this.view = this.zone.runOutsideAngular(() => mountArchitecture3d(this.root().nativeElement, this.vis, {
      routes: ARCHITECTURE_3D_ROUTES,
      navigate: route => this.zone.run(() => void this.router.navigateByUrl(route)),
    }));
    this.view.setSearch(untracked(this.search.matcher) ?? undefined);
  }

  ngOnDestroy() {
    this.view?.dispose();
  }
}

// Both components share the template and styles; ViewEncapsulation.None because the engine builds
// labels, cards and tooltips outside the template (every style rule is scoped under .arch3d).

/** RAG application architecture in 3D: offline ingestion, retrieval and generation. */
@Component({
  selector: 'app-rag-architecture-3d',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './architecture-3d.component.html',
  styleUrls: ['./architecture-3d.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RagArchitecture3dComponent extends Architecture3dComponentBase {
  protected readonly vis = 'rag';
}

/** Agentic AI architecture in 3D: the agent loop with its tools, memory, sub-agents and guardrails. */
@Component({
  selector: 'app-agentic-architecture-3d',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './architecture-3d.component.html',
  styleUrls: ['./architecture-3d.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgenticArchitecture3dComponent extends Architecture3dComponentBase {
  protected readonly vis = 'agentic';
}
