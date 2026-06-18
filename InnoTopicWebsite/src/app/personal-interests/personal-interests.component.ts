import { Component, OnInit } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-personal-interests',
  templateUrl: './personal-interests.component.html',
  styleUrls: ['./personal-interests.component.sass']
})
export class PersonalInterestsComponent implements OnInit {

  // Chess, Psychology, Volleyball (take from topics)

  constructor() { }

  ngOnInit() {
  }

}
