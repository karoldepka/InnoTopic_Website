import { Component } from '@angular/core';

interface InfoItem {
  label: string;
  value: string;
}

@Component({
  standalone: true,
  selector: 'app-personal-data',
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.sass'],
})
export class PersonalDataComponent {
  infoItems: InfoItem[] = [
    { label: 'First Name', value: 'Karol' },
    { label: 'Last Name', value: 'Depka Pradzinski' },
    { label: 'Birth Date', value: '1984-12-07' },
    { label: 'Pronouns', value: 'he/him/himself/his' },
    { label: 'Nationality', value: 'Polish' },
    { label: 'Education', value: 'Computer Science University Engineering Degree - Computer Programming and Networks (maximum grade)' },
    { label: "Driver's license", value: 'B (Passenger cars)' },
  ];
}
