import { Component } from '@angular/core';

@Component({
  selector: 'app-theme-samples',
  standalone: false,
  templateUrl: './theme-samples.component.html',
  styleUrls: ['./theme-samples.component.scss'],
})
export class ThemeSamplesComponent {

  abs = Math.abs

  colorNames = ['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger']

}
