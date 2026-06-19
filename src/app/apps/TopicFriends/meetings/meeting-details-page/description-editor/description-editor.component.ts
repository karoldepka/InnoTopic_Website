import { Component, forwardRef, Input, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, UntypedFormControl, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  standalone: false,
  selector: 'app-description-editor',
  templateUrl: './description-editor.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./description-editor.component.sass'],
})
export class DescriptionEditorComponent implements OnInit {

  @Input() control ! : UntypedFormControl;

  constructor() { }

  ngOnInit() {}
}
