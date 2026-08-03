import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search/search.component';
import { FormsModule } from '@angular/forms';
import { SearchResultRowComponent } from './search/search-result-row/search-result-row.component'
import { TreeSharedModule } from '../tree-shared/tree-shared.module'

@NgModule({
    exports: [
        SearchComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        TreeSharedModule,
        SearchComponent,
        SearchResultRowComponent,
    ],
})
export class SearchModule { }
