import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CopilotKitCompareRoutingModule } from './copilotkit-compare-routing.module';
import { CopilotKitComparePage } from './copilotkit-compare.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        CopilotKitCompareRoutingModule,
        CopilotKitComparePage,
    ],
})
export class CopilotKitCompareModule {}
