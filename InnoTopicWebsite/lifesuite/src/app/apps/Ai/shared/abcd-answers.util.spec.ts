import { shuffleAbcdAnswerChoices, toBowQuizQuestion } from './abcd-answers.util';

describe('toBowQuizQuestion', () => {
  it('parses four choices and the marked correct answer', () => {
    const result = toBowQuizQuestion({
      categoryId: 'rxjs',
      categoryPath: 'Angular / RxJS',
      question: 'Which operator combines the latest values?',
      answer: 'A. mergeMap\nB. ✓ combineLatest\nC. debounceTime\nD. catchError',
    });

    expect(result?.answers).toEqual([
      { id: 'a', label: 'A', text: 'mergeMap', correct: false },
      { id: 'b', label: 'B', text: 'combineLatest', correct: true },
      { id: 'c', label: 'C', text: 'debounceTime', correct: false },
      { id: 'd', label: 'D', text: 'catchError', correct: false },
    ]);
  });

  it('rejects answers without exactly one marked choice', () => {
    expect(toBowQuizQuestion({
      categoryId: 'x', categoryPath: 'x', question: 'x',
      answer: 'A. one\nB. two\nC. three\nD. four',
    })).toBeNull();
  });
});

describe('shuffleAbcdAnswerChoices', () => {
  it('shuffles choices, relabels their displayed positions, and preserves correctness', () => {
    const choices = [
      { id: 'a', label: 'A', text: 'first', correct: false },
      { id: 'b', label: 'B', text: 'second', correct: true },
      { id: 'c', label: 'C', text: 'third', correct: false },
      { id: 'd', label: 'D', text: 'fourth', correct: false },
    ];

    const shuffled = shuffleAbcdAnswerChoices(choices, () => 0);

    expect(shuffled.map(choice => choice.id)).toEqual(['b', 'c', 'd', 'a']);
    expect(shuffled.map(choice => choice.label)).toEqual(['A', 'B', 'C', 'D']);
    expect(shuffled.filter(choice => choice.correct).map(choice => choice.id)).toEqual(['b']);
    expect(choices.map(choice => choice.label)).toEqual(['A', 'B', 'C', 'D']);
  });
});
