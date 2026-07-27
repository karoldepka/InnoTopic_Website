import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import {
  HashtagReplacerComponent,
  splitIntoHashtagParts,
} from './hashtag-replacer.component';

describe('splitIntoHashtagParts', () => {
  it('returns a single plain-text part when there are no hashtags', () => {
    expect(splitIntoHashtagParts('no tags here')).toEqual([
      { text: 'no tags here', isTag: false },
    ]);
  });

  it('splits leading, trailing and inline text around hashtags', () => {
    expect(splitIntoHashtagParts('Hello #Angular and #C++ !')).toEqual([
      { text: 'Hello ', isTag: false },
      { text: '#Angular', isTag: true, tagText: '#Angular' },
      { text: ' and ', isTag: false },
      { text: '#C++', isTag: true, tagText: '#C++' },
      { text: ' !', isTag: false },
    ]);
  });

  it('does not treat a hyphen/dot-joined word as extending a preceding hashtag', () => {
    // regression check for the "Gerrit-based" bug: HASHTAG_REGEX itself is greedy about
    // trailing '-'/'.' *within* a match, this just documents that a plain-text word is never
    // reinterpreted as a tag just because another #hashtag happens to precede it in the string.
    expect(splitIntoHashtagParts('#Gerrit not the same as Gerrit-based')).toEqual([
      { text: '#Gerrit', isTag: true, tagText: '#Gerrit' },
      { text: ' not the same as Gerrit-based', isTag: false },
    ]);
  });
});

describe('HashtagReplacerComponent', () => {
  let component: HashtagReplacerComponent;
  let fixture: ComponentFixture<HashtagReplacerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      // HashtagReplacerComponent is standalone: belongs in imports, not declarations.
      imports: [HashtagReplacerComponent, IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HashtagReplacerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
