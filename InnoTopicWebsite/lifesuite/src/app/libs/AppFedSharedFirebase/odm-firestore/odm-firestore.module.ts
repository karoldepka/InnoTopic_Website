import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {OdmModule} from "../../AppFedShared/odm/odm.module";
import {FirestoreOdmBackend} from "./firestore-odm-backend.service";
import {OdmBackend} from "../../AppFedShared/odm/OdmBackend";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    OdmModule,
  ],
  providers: [
    {provide: OdmBackend, useClass: FirestoreOdmBackend},
  ],
  exports: [
    OdmModule,
  ]
})
export class OdmFirestoreModule { }
