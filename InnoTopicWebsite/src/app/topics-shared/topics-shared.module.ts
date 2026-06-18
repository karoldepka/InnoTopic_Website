import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { TopicsCoreModule } from '../TopicFriendsShared3/topics-core/topics-core.module';
import { TopicLogoComponent } from './topic-logo/topic-logo.component';
import { TopicTagComponent } from './topic-tag/topic-tag.component';
import {TopicsListComponent} from "./topics-list/topics-list.component";
import {HashtagReplacerComponent} from "./hashtag-replacer/hashtag-replacer.component";
import {BooksComponent} from "../books/books.component";

@NgModule({
  imports: [
    CommonModule,
    TopicsCoreModule,
    SharedModule,
    TopicLogoComponent,
    TopicTagComponent,
    TopicsListComponent,
    HashtagReplacerComponent,
    BooksComponent,
  ],
  exports: [
    TopicLogoComponent,
    TopicTagComponent,
    TopicsListComponent,
    HashtagReplacerComponent,
    BooksComponent,
    CommonModule,
    TopicsCoreModule,
    SharedModule,
  ]
})
export class TopicsSharedModule { }
