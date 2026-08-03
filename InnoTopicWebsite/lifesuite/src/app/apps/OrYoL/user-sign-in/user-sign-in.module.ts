import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSignInComponent } from './user-sign-in/user-sign-in.component'
import { UserSignInRoutingModule } from './user-sign-in.routing.module'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    UserSignInRoutingModule,
    UserSignInComponent,
  ]
})
export class UserSignInModule { }
