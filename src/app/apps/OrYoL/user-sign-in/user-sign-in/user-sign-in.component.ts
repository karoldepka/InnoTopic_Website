import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../core/auth.service'

@Component({
  standalone: false,
  selector: 'app-user-sign-in',
  templateUrl: './user-sign-in.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./user-sign-in.component.scss']
})
export class UserSignInComponent implements OnInit {

  constructor(
    public authService: AuthService
  ) { }

  ngOnInit() {
  }

  requestSignIn() {
    this.authService.requestSignIn()
  }
}
