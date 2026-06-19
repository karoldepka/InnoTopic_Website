import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HashtagReplacerComponent } from '../topics-shared/hashtag-replacer/hashtag-replacer.component';
import { ThreeDTextComponent } from '../shared/threed-text/threed-text.component';
import {booksData} from "./books.data";

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, HashtagReplacerComponent, ThreeDTextComponent],
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.scss'],
})
export class BooksComponent  implements OnInit {

  books = booksData

  constructor() { }

  ngOnInit() {}

}
