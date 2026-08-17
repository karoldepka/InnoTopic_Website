import {Component, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { Router } from '@angular/router'
import {FeatureService} from '../../../libs/AppFedShared/feature.service'
import {BaseComponent} from '../../../libs/AppFedShared/base/base.component'
import { IonicModule } from '@ionic/angular';
import { SyncStatusIconComponent } from '../../../libs/AppFedShared/odm/sync-status/sync-status-icon.component';
import { NgIf, NgFor } from '@angular/common';
import { QuizButtonComponent } from '../shared/quiz-button/quiz-button.component';
import { EnergyGraphComponent } from '../energy-graph/energy-graph.component';
import {SlotUsageTrackerService} from '../../../libs/AppFedShared/tree/cells/slot-usage-tracker.service'
import {rankDestinations, WhatNextDestination} from './what-next-destination-ranking'
import {WhatNextActionsService} from './what-next-actions.service'

@Component({
    selector: 'app-what-next',
    templateUrl: './what-next.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./what-next.page.scss'],
    imports: [
        IonicModule,
        SyncStatusIconComponent,
        NgIf,
        NgFor,
        QuizButtonComponent,
        EnergyGraphComponent,
    ],
})
export class WhatNextPage extends BaseComponent implements OnInit {

  /** GH #103: shared with the field-picker's own MRU tracking (SlotUsageTrackerService,
   * originally built for GH #101) instead of a second, page-specific implementation - same
   * server-synced-per-user row shape, just a different namespace so the two id-spaces (field
   * descriptor ids vs. these destination ids) can never collide. */
  private static readonly MRU_NAMESPACE = 'what-next'

  searchTerm = ''

  /** Real, actionable destinations - searchable and MRU-tracked. Order here is the fallback
   * (at-rest, no search, no usage history yet) display order - kept close to the original
   * template's top-to-bottom order. */
  readonly destinations: WhatNextDestination[] = [
    {
      id: 'affirmations',
      label: 'Affirmations',
      route: '/learn/item/LearnItem__2022-05-26__17.33.46.061Z_',
      visibleIf: () => this.g.feat.showExperimental,
    },
    {
      id: 'craving-fun',
      label: 'Craving fun Panic Button',
      action: () => this.whatNextActions.cravingFun(),
    },
    {id: 'ai-qa', label: 'Generate questions, answers', route: '/ai/qa', size: 'big'},
    {id: 'ai-chat', label: 'AI Chat', route: '/learn/ai-chat'},
    {id: 'copilotkit', label: 'CopilotKit', route: '/copilotkit'},
    {id: 'bow-quiz', label: 'Bow Quiz', route: '/learn/bow-quiz'},
    {
      id: 'why-bother',
      label: 'Why Bother?',
      note: 'Why am I doing all this?',
      action: () => this.whatNextActions.whyBother(),
    },
    {id: 'lifedvisor-legacy', label: 'Lifedvisor', route: '/lifedvisor', visibleIf: () => this.feat.tutorial.unpolished},
    {id: 'ask', label: 'Lifedvisor', route: '/ask'},
    {id: 'plan', label: 'Plan', route: '/tree'},
    {id: 'tutorial', label: 'LifeSuite App Tutorial', route: '/tutorial', visibleIf: () => this.feat.tutorial.unpolished},
    {id: 'mindfulness', label: 'Mindfulness', route: '/mindfulness'},
    {
      id: 'contemplate',
      label: 'Contemplate',
      note: 'Life Overviews',
      route: '/contemplate-life',
      visibleIf: () => this.g.feat.showExperimental,
    },
    {id: 'sleep', label: 'Sleep', route: '/sleep'},
    {
      id: 'item-processing',
      label: 'Process Learn Items (& tasks)',
      route: '/item-processing',
      visibleIf: () => this.g.feat.showExperimental,
    },
    {id: 'categories', label: 'Categories', route: '/categories', visibleIf: () => this.g.feat.showExperimental},
    {
      id: 'categories-stats',
      label: 'Categories Stats',
      route: '/categories-stats',
      visibleIf: () => this.g.feat.showExperimental,
    },
    {id: 'do-tasks', label: 'Do tasks', route: '/learn'},
    {id: 'write-journal', label: 'Write Journal', route: '/journal/write'},
    {id: 'retrospective', label: 'RETROSPECTIVE', route: '/journal'},
    {id: 'success-chance', label: 'Success Probability Calc', route: '/success-chance'},
    {id: 'exponential-improvement', label: 'Exponential Improvement', route: '/exponential-improvement'},
    {
      id: 'learn-stats',
      label: 'Check Your progress',
      route: '/learn/stats',
      visibleIf: () => this.g.feat.showExperimental,
    },
  ]

  constructor(
    public featureService: FeatureService,
    public router: Router,
    private slotUsageTrackerService: SlotUsageTrackerService,
    private whatNextActions: WhatNextActionsService,
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnInit() {
  }

  onSearchChange(term: string): void {
    this.searchTerm = term
  }

  /** `visibleIf` mirrors the feature-flag gating each button had inline in the old template
   * (`*ngIf="g.feat.X"`) - evaluated fresh on every access here (not cached), so toggling a flag
   * while this page is open still takes effect immediately, same as before. */
  get visibleDestinations(): WhatNextDestination[] {
    return this.destinations.filter(d => !d.visibleIf || d.visibleIf())
  }

  get filteredDestinations(): WhatNextDestination[] {
    const visible = this.visibleDestinations
    const mostRecentlyUsedIds = this.searchTerm.trim()
      ? []
      : this.slotUsageTrackerService.getMostRecentlyUsedIds(WhatNextPage.MRU_NAMESPACE, visible.length)
    return rankDestinations(visible, this.searchTerm, mostRecentlyUsedIds)
  }

  go(destination: WhatNextDestination): void {
    this.slotUsageTrackerService.recordUsage(WhatNextPage.MRU_NAMESPACE, destination.id)
    if (destination.action) {
      destination.action()
      return
    }
    if (destination.route) {
      this.router.navigateByUrl(destination.route)
    }
  }

}
