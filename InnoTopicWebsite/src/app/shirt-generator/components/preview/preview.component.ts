import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-preview',
  standalone: false,
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent  implements OnInit {

  @Input() item: string = '';

  constructor() { }

  ngOnInit() {}

}
