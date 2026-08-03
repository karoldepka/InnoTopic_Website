import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
