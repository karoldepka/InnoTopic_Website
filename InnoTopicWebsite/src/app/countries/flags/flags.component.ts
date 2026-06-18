import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountryFlagComponent } from '../country-flag/country-flag.component';

@Component({
  selector: 'app-flags',
  standalone: true,
  imports: [CommonModule, CountryFlagComponent],
  templateUrl: './flags.component.html',
  styleUrls: ['./flags.component.sass']
})
export class FlagsComponent implements OnInit {

  @Input() flags!: string
  flagsArray!: any;

  constructor() { }

  ngOnInit() {
    this.flagsArray = this.flags.split(' ').map(_ => _ === 'uk' ? 'gb' : _)
  }

}
