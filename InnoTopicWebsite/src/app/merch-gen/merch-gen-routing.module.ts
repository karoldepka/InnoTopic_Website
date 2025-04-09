import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MerchGenPage } from './merch-gen.page';

const routes: Routes = [
  {
    path: '',
    component: MerchGenPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MerchGenPageRoutingModule {}
