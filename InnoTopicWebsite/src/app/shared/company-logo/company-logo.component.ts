import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-logo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-logo.component.html',
  styleUrls: ['./company-logo.component.css']
})
export class CompanyLogoComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
