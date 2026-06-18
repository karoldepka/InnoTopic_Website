import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

/** way to wrap a single space without adding the significant whitespace around it */
@Component({
  selector: 'app-spacer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spacer.component.html',
  styleUrls: ['./spacer.component.sass']
})
export class SpacerComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
