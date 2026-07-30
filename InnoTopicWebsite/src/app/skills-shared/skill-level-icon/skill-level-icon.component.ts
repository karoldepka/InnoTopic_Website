import {
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSkillLevelEnum } from '../../TopicFriendsShared3/skills/skills-core/user-skills';

@Component({
  selector: 'app-skill-level-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-level-icon.component.html',
  styleUrls: ['./skill-level-icon.component.sass']
})
export class SkillLevelIconComponent implements OnInit {

  @Input() skillLevel: UserSkillLevelEnum
  @Input() iconSize = 12
  get levelValue(): number {
    const level = this.skillLevel ?? 'none';
    return ({ none: 1, beginner: 2, intermediate: 3, advanced: 4, expert: 5 } as const)[level];
  }

  constructor() { }

  ngOnInit() {
  }

}
