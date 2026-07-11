import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AskPage } from './ask.page';
import { AskLogPage } from './ask-log/ask-log.page';

const routes: Routes = [
  {
    path: '',
    component: AskPage
  },
  {
    path: 'log',
    component: AskLogPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AskPageRoutingModule {}
