import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgFor } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import {Dict, getDictionaryValuesAsArray, setIdsFromKeys} from '../../../libs/AppFedShared/utils/dictionary-utils';

/* make it more like "translation" instead of translator, to avoid fixed labels; and to widen the audience
better: activities (&occupations)?
*/
export class Occupations {
  'Travel' = {}
  Expatriate = {}
  'Language Learner' = {}
  YouTuber = {}
  Filmmaker = {}
  Programmer = {}
  'App Entrepreneur' = {}
  Manager = {} // delegation, etc.
  Employee = {}
  'Consultant / Freelancer' = {}
  'Writer' = {}
  'Copywriter' = {}
  'Blogger' = {}
  'Food Blogger' = {}
  'Graphic Designer' = {}
  'UI Designer' = {}
  'Frontend Development' = {}
  'Translation' = {}
  'Digital Nomad' = {}
  'Airbnb' = {}
  'Cooking' = {}
}

interface OccupationItem {
  id: string
}

export const occupations: OccupationItem[] = getDictionaryValuesAsArray(
  setIdsFromKeys(new Occupations() as unknown as Dict<OccupationItem>),
)

@Component({
  standalone: true,
  imports: [IonicModule, NgFor],
  selector: 'app-occupations',
  templateUrl: './occupations.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./occupations.page.scss'],
})
export class OccupationsPage implements OnInit {

  occupations: OccupationItem[] = occupations

  constructor() { }

  ngOnInit() {
  }

}
