import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CopilotKitComparePage } from './copilotkit-compare.page';

const routes: Routes = [
  {
    path: '',
    component: CopilotKitComparePage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CopilotKitCompareRoutingModule {}
