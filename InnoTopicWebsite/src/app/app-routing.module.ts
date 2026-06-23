import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const loadExperiments = () => import('./experiments/experiments.module').then(m => m.ExperimentsPageModule);
const loadShirtGenerator = () => import('./shirt-generator/shirt-generator.module').then(m => m.ShirtGeneratorPageModule);
const loadThemeDemo = () => import('./themes/theme-demo/theme-demo.module').then(m => m.ThemeDemoPageModule);
const loadTopicsGraph = () => import('./cv-page/topics-graph/topics-graph.component').then(m => m.TopicsGraphComponent);

const routes: Routes = [
  {
    path: '',
    redirectTo: 'karol-depka',
    pathMatch: 'full'
  },
  {
    path: 'folder/:id',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  },
  {
    path: 'theme-demo',
    loadChildren: loadThemeDemo
  },
  {
    path: 'theme',
    loadChildren: loadThemeDemo
  },
  {
    path: 'shirt',
    loadChildren: () => import('./shirt/shirt.module').then( m => m.ShirtPageModule)
  },
  {
    path: 'karol-depka',
    loadChildren: () => import('./cv/cv.module').then( m => m.CvPageModule)
  },
  {
    path: 'print',
    loadChildren: () => import('./cv-page-print/cv-page-print.module').then(m => m.CvPagePrintPageModule)
  },
  {
    path: 'topics-graph',
    loadComponent: loadTopicsGraph,
  },
  {
    path: 'graph',
    loadComponent: loadTopicsGraph,
  },
  {
    path: 'test-tag',
    loadChildren: () => import('./test-tag/test-tag.module').then( m => m.TestTagPageModule)
  },
  {
    path: 'experiments',
    loadChildren: loadExperiments
  },
  {
    path: 'config',
    loadChildren: loadExperiments
  },
  {
    path: 'shirt-generator',
    loadChildren: loadShirtGenerator
  },
  {
    path: 'shirt-gen',
    loadChildren: loadShirtGenerator
  },
  {
    path: 'shirtgen',
    loadChildren: loadShirtGenerator
  },
  {
    path: 'people',
    loadChildren: () => import('./people/people.module').then( m => m.PeoplePageModule)
  },

  {
    path: 'merch-gen',
    loadChildren: () => import('./merch-gen/merch-gen.module').then( m => m.MerchGenPageModule)
  },
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then( m => m.ChatPageModule)
  },
  { path: '**', redirectTo: 'karol-depka' },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
