import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-lifedvisor',
  templateUrl: './lifedvisor.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./lifedvisor.page.scss'],
})
export class LifedvisorPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
