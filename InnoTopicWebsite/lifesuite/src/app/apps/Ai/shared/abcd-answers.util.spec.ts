import { toBowQuizQuestion } from './abcd-answers.util';

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
