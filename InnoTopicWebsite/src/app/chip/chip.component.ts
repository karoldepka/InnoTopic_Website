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
  /** Drops the fixed pill font-size/padding so the chip blends into surrounding running text instead of standing out as a discrete tag. */
  inline = input(false);
}
