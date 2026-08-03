import { Component, OnInit } from '@angular/core';
import { ExampleCellComponent } from '../../cells/example-cell/example-cell.component';

@Component({
  standalone: true,
  imports: [ExampleCellComponent],
  selector: 'app-task-node-content',
  templateUrl: './task-node-content.component.html',
  styleUrls: ['./task-node-content.component.sass']
})
export class TaskNodeContentComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
