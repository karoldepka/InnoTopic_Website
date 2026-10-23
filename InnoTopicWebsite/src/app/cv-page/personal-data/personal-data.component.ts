import { Component } from '@angular/core';
import { personalDataItems } from './personal-data.data';

@Component({
  standalone: true,
  selector: 'app-personal-data',
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.sass'],
})
export class PersonalDataComponent {
  infoItems = personalDataItems;
}
