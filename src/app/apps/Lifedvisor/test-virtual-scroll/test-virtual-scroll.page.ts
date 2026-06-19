import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-test-virtual-scroll',
  templateUrl: './test-virtual-scroll.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./test-virtual-scroll.page.scss'],
})
export class TestVirtualScrollPage implements OnInit {

  items: string[] = []

  constructor() {
    for (let i = 0; i < 1000; ++i) {
      this.items.push('item ' + i)
    }
  }

  ngOnInit() {
  }

}
