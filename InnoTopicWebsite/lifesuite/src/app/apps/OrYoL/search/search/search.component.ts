import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import { SearchService } from '../../core/search.service'
import { NavigationService } from '../../core/navigation.service'
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { NodeClassIconComponent } from '../../tree-shared/node-content/node-class-icon/node-class-icon.component';


@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./search.component.sass'],
    imports: [ReactiveFormsModule, FormsModule, NgFor, NodeClassIconComponent]
})
export class SearchComponent implements OnInit, AfterViewInit {
  // searchText: string
  textFieldDummy!: any
  filteredNodes: any[] = []

  @ViewChild('searchInput', {static: true}) searchInput!: ElementRef

  constructor(
    public searchService: SearchService,
    public navigationService: NavigationService,
  ) { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    console.log('SearchComponent ngOnInit()')
    this.searchInput.nativeElement.focus()
  }

  searchText($event: Event) {
    // console.log($event)
    this.searchService.search($event as any as string).subscribe(results => {
      // console.log('Service search got results', results)
      this.filteredNodes = results.slice(0, 50)
    })
  }

  navigateTo(node: any) {
    this.navigationService.navigateToNodeLastChild(node)
  }
}
