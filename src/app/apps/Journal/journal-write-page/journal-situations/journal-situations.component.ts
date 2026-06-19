import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-journal-situations',
  templateUrl: './journal-situations.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./journal-situations.component.css']
})
export class JournalSituationsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
