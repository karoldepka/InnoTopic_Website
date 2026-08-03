import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MeetingDetailsPage} from "./meeting-details.page";

const routes: Routes = [
  { path: '', component: MeetingDetailsPage}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeetingDetailsPageRoutingModule { }
