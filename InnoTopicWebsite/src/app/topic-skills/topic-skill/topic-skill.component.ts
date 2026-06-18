import {
  ApplicationRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopicTagComponent } from '../../topics-shared/topic-tag/topic-tag.component';
import { SkillLevelsIconsComponent } from '../../skills-shared/skill-levels-icons/skill-levels-icons.component';
import {
  UserSkillLevelsHaveWant,
  UserSkillLevelsHaveWant2,
} from '../../TopicFriendsShared3/skills/skills-core/user-skills';

@Component({
  selector: 'app-topic-skill',
  standalone: true,
  imports: [CommonModule, TopicTagComponent, SkillLevelsIconsComponent],
  templateUrl: './topic-skill.component.html',
  styleUrls: ['./topic-skill.component.sass']
})
export class TopicSkillComponent implements OnInit {

  @Input() tId!: string;

  @Input() skillLevels!: UserSkillLevelsHaveWant2

  @Input() showLogo!: boolean

  constructor(
    public app: ApplicationRef
  ) {

  }

  ngOnInit() {
    // this.app.tick()
  }

  ngAfterViewInit() {
    // this.app.tick()
  }

}
