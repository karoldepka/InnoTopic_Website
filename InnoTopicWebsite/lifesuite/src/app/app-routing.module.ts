import { inject, Injectable, NgModule } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PreloadAllModules, RouterModule, RouterStateSnapshot, Routes, TitleStrategy } from '@angular/router';

/** Every route sets the document title as "LifeSuite - <route title>"; untitled routes show just "LifeSuite". */
@Injectable()
export class LifeSuiteTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot) {
    const pageTitle = this.buildTitle(snapshot);
    this.title.setTitle(pageTitle ? `LifeSuite - ${pageTitle}` : 'LifeSuite');
  }
}

const routes: Routes = [
  {
    path: '',
    redirectTo: '/journal',
    pathMatch: 'full'
  },

  {
    path: 'conflicts/:collection/:winnerId/:loserId',
    title: 'Sync Conflict',
    loadComponent: () => import('./libs/AppFedSharedBrowser/odm-browser/odm-conflict-details.page').then(m => m.OdmConflictDetailsPage),
  },

  {
    path: 'timers',
    title: 'Timers',
    loadChildren: () => import('./timers/timers.module').then(m => m.TimersPageModule)
  },

  { path: 'journal/write',
    title: 'Write Journal Entry',
    loadChildren: () => import('./apps/Journal/journal-write-page/journal-write.page.module').then(m => m.JournalWritePageModule) },
  { path: 'journal/entry',
    title: 'Journal Entry',
    loadChildren: () => import('./apps/Journal/journal-write-page/journal-write.page.module').then(m => m.JournalWritePageModule) },
  // { path: 'journal/charts',
  //   loadChildren: () => import('./apps/Journal/journal-charts/journal-charts.module').then(m => m.JournalChartsPageModule) },
  {
    path: 'journal',
    title: 'Journal',
    loadChildren: () => import('./apps/Journal/journal-entries-list/journal-entries-list.module').then( m => m.JournalEntriesListPageModule)
  },


  { path: 'TopicFriends',
    title: 'TopicFriends',
    loadChildren: () => import('./apps/TopicFriends/topic-friends.module').then(m => m.TopicFriendsModule) },
  { path: 'auth',
    title: 'Sign In',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthPageModule) },
  { path: 'learn/item',
    title: 'Learn Item',
    loadChildren: async () => (await import('./apps/Learn/learn-item-details/learn-item-details.module')).LearnItemDetailsPageModule
  },
  { path: 'learn/quiz',
    title: 'Quiz',
    loadChildren: () => import('./apps/Learn/quiz/quiz.module').then(m => m.QuizPageModule)
  },
  { path: 'learn/bow-quiz',
    title: 'Bow Quiz',
    loadChildren: () => import('./apps/Learn/bow-quiz/bow-quiz.module').then(m => m.BowQuizModule)
  },
  {
    path: 'learn/stats',
    title: 'Learn Stats',
    loadChildren: () => import('./apps/Learn/learn-stats/learn-stats.module').then( m => m.LearnStatsPageModule)
  },
  {
    path: 'learn/ai-chat',
    title: 'AI Chat',
    loadComponent: () => import('./apps/Learn/learn-ai-chat/learn-ai-chat.page').then(m => m.LearnAiChatPage),
  },
  { path: 'learn',
    title: 'Learn',
    loadChildren: () => import('./apps/Learn/search-or-add-learnable-item/search-or-add-learnable-item.module').then(m => m.SearchOrAddLearnableItemPageModule),
    data: { shouldReuse: true },
  },
  {
    path: 'what-next',
    title: 'What Next?',
    loadChildren: async () => (await import('./apps/Learn/what-next/what-next.module')).WhatNextPageModule
  },
  {
    path: 'tutorial',
    title: 'Tutorial',
    loadChildren: () => import('./shared/tutorial/tutorial.module').then( m => m.TutorialPageModule)
  },
  {
    path: 'mindfulness',
    title: 'Mindfulness',
    loadChildren: () => import('./apps/Mindfulness/mindfulness/mindfulness.module').then( m => m.MindfulnessPageModule)
  },
  {
    path: 'sleep',
    title: 'Sleep',
    loadChildren: () => import('./apps/sleep/sleep.module').then( m => m.SleepPageModule)
  },
  {
    path: 'categories',
    title: 'Categories',
    loadChildren: () => import('./apps/Common/categories/categories.module').then( m => m.CategoriesPageModule)
  },
  {
    path: 'tree',
    title: 'Tree',
    loadChildren: () => import('./apps/OrYoL/tree-page/tree-page.module').then(m => m.TreePageModule)
  },
  {
    path: 'item-processing',
    title: 'Item Processing',
    loadChildren: () => import('./apps/Learn/item-processing/item-processing.module').then( m => m.ItemProcessingPageModule)
  },
  {
    path: 'success-chance',
    title: 'Success Probability',
    loadChildren: () => import('./apps/Learn/success-chance/success-chance.module').then( m => m.SuccessChancePageModule)
  },
  {
    path: 'exponential-improvement',
    title: 'Exponential Improvement',
    loadChildren: () => import('./apps/Learn/exponential-improvement/exponential-improvement.module').then( m => m.ExponentialImprovementPageModule)
  },
  {
    path: 'categories-stats',
    title: 'Categories Stats',
    loadChildren: () => import('./libs/AppFedShared/categories-stats-page/categories-stats-page.module').then( m => m.CategoriesStatsPagePageModule)
  },

  {
    path: 'lifedvisor',
    title: 'Lifedvisor',
    loadChildren: () => import('./apps/Lifedvisor/lifedvisor/lifedvisor.module').then(m => m.LifedvisorPageModule)
  },
  {
    path: 'ask',
    title: 'Ask',
    loadChildren: () => import('./apps/Lifedvisor/ask/ask.module').then(m => m.AskPageModule)
  },
  {
    path: 'ai/qa',
    title: 'Q&A Generator',
    loadComponent: () => import('./apps/Ai/ai-qa/ai-qa.page').then(m => m.AiQaPage),
  },
  {
    path: 'ai-generate-q-and-a/copilotkit',
    title: 'Q&A · CopilotKit',
    loadComponent: () => import('./apps/Ai/ai-generate-q-and-a/copilotkit/copilotkit-qa.page').then(m => m.CopilotkitQaPage),
  },
  {
    path: 'ai',
    title: 'AI Integrations',
    loadComponent: () => import('./apps/Ai/ai-hub/ai-hub.page').then(m => m.AiHubPage),
  },
  {
    path: 'copilotkit',
    title: 'AI Copilot',
    loadChildren: () => import('./apps/CopilotKit/copilotkit-compare/copilotkit-compare.module').then(m => m.CopilotKitCompareModule)
  },
  {
    path: 'vercel-ai-sdk',
    redirectTo: 'ai/qa',
    pathMatch: 'full',
  },
  {
    path: 'life-overviews',
    title: 'Life Overviews',
    loadChildren: () => import('./apps/Lifedvisor/life-overviews/life-overviews.module').then(m => m.LifeOverviewsPageModule)
  },
  {
    path: 'rationale',
    title: 'Rationale',
    loadChildren: () => import('./apps/Lifedvisor/rationale/rationale.module').then(m => m.RationalePageModule)
  },
  {
    path: 'occupations',
    title: 'Occupations',
    loadChildren: () => import('./apps/Lifedvisor/occupations/occupations.module').then(m => m.OccupationsPageModule)
  },
  {
    path: 'about-lifedvisor',
    title: 'About Lifedvisor',
    loadChildren: () => import('./apps/Lifedvisor/about/about.module').then(m => m.AboutPageModule)
  },

  {
    path: 'experiments',
    title: 'Experiments',
    loadComponent: () => import('./experiments/experiments.page').then(m => m.ExperimentsPage),
  },
  {
    path: 'audio',
    title: 'Audio',
    loadChildren: () => import('./apps/Learn/audio/audio.module').then(m => m.AudioPageModule)
  },

  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule],
  providers: [{ provide: TitleStrategy, useClass: LifeSuiteTitleStrategy }],
})
export class AppRoutingModule {}
