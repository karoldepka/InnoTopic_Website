import {Component, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser'
import {convertToHtmlIfNeeded} from '../../utils/html-utils'
import {nullish} from '../../utils/type-utils'
import { NgIf } from '@angular/common';


@Component({
    selector: 'app-rich-text-view',
    templateUrl: './rich-text-view.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./rich-text-view.component.sass'],
    imports: [NgIf],
})
export class RichTextViewComponent implements OnInit {

  @Input() htmlString ! : string | nullish

  constructor(
    public domSanitizer: DomSanitizer,
  ) { }


  ngOnInit() {
    this.htmlString = convertToHtmlIfNeeded(this.htmlString)
  }

}
