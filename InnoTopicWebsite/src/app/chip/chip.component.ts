import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

@Component({
  selector: 'app-chip',
  standalone: true,
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipComponent {
  /** Forces the :hover neumorphic shadow to show without an actual pointer hover - for showcases/demos. */
  forceMouseOver = input(false);
}
