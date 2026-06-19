import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {}
