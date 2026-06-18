import { Component, OnInit } from '@angular/core';
import {peopleArray} from "./people.data";

@Component({
  standalone: false,
  selector: 'app-people',
  templateUrl: './people.page.html',
  styleUrls: ['./people.page.scss'],
})
export class PeoplePage implements OnInit {

  peopleArray = peopleArray

  constructor() { }

  ngOnInit() {
  }

}
