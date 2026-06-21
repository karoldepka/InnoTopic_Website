import { Component } from '@angular/core';
import { OtherProfilesModule } from '../../TopicFriendsShared3/other-profiles/other-profiles.module';
import { externalProfilesKarol } from './external-profiles-karol';

@Component({
  standalone: true,
  imports: [OtherProfilesModule],
  selector: 'app-external-profiles',
  templateUrl: './external-profiles.component.html',
  styleUrls: ['./external-profiles.component.sass'],
})
export class ExternalProfilesComponent {
  otherProfiles = externalProfilesKarol;
}
