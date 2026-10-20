import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-page-break-demo',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './page-break-demo.component.html',
  styleUrls: ['./page-break-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageBreakDemoComponent {}
