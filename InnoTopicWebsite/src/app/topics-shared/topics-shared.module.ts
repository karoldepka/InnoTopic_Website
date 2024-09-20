import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { TopicsCoreModule } from '../TopicFriendsShared3/topics-core/topics-core.module';
import { TopicLogoComponent } from './topic-logo/topic-logo.component';
import { TopicTagComponent } from './topic-tag/topic-tag.component';
import {ThemeDemoPageModule} from "../themes/theme-demo/theme-demo.module";
import {TopicsListComponent} from "./topics-list/topics-list.component";
import {HashtagReplacerComponent} from "./hashtag-replacer/hashtag-replacer.component";
import {BooksComponent} from "../books/books.component";

let declarations = [
  TopicLogoComponent,
  TopicTagComponent,
  TopicsListComponent,
  HashtagReplacerComponent,
  BooksComponent,
];

let imports = [
  CommonModule,
  TopicsCoreModule,
  SharedModule,
];

@NgModule({
  imports: [
    imports,
    ThemeDemoPageModule
  ],
  declarations,
  exports: [
    ...declarations,
    ...imports,
  ]
})
export class TopicsSharedModule { }
