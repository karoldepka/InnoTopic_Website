import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BowQuizPage } from './bow-quiz.page';

const routes: Routes = [
  {
    path: '',
    component: BowQuizPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BowQuizRoutingModule {}
