import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { BowQuizRoutingModule } from './bow-quiz-routing.module';
import { BowQuizPage } from './bow-quiz.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    BowQuizRoutingModule,
  ],
  declarations: [
    BowQuizPage,
  ],
})
export class BowQuizModule {}
