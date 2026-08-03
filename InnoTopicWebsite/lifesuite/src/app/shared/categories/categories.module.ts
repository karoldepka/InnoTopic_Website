import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CategoriesComponent} from './categories.component'
import {TreeModule} from 'primeng/tree'
import {HttpClient, HttpClientModule} from '@angular/common/http'
import {OdmTreeModule} from '../../libs/AppFedShared/tree/odm-tree.module'



@NgModule({
    exports: [
        CategoriesComponent,
    ],
    imports: [
        CommonModule,
        TreeModule,
        OdmTreeModule,
        CategoriesComponent,
    ],
})
export class CategoriesModule { }
