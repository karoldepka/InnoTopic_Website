import React from 'react';
import { createRoot } from 'react-dom/client';
import Matter from 'matter-js';
import './frame.css';

const { Engine, Bodies, Body, Composite, Events } = Matter;

const SESSION_KEY = 'LifeSuite.BowQuiz.questions';
const DEFAULT_QUESTIONS = [{
  question: 'Which RxJS operator combines the latest values from multiple streams?',
  answers: [
    { id: 'a', label: 'A', text: 'mergeMap', correct: false },
    { id: 'b', label: 'B', text: 'combineLatest', correct: true },
    { id: 'c', label: 'C', text: 'debounceTime', correct: false },
    { id: 'd', label: 'D', text: 'catchError', correct: false },
  ],
}];

function loadQuestions() {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) || 'null');
    if (Array.isArray(parsed) && parsed.length && parsed.every(item =>
      typeof item?.question === 'string'
      && Array.isArray(item.answers)
      && item.answers.length === 4
      && item.answers.filter(answer => answer?.correct).length === 1)) {
      return parsed;
    }
  } catch (error) {
    console.warn('[bow-quiz] Could not load generated questions', error);
  }
  return DEFAULT_QUESTIONS;
}

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'pl', label: 'Polski' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ca', label: 'Català' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'zh', label: '中文' },
  { code: 'ru', label: 'Русский' },
];

const TRANSLATIONS = {
  en: {
    title: 'Bow Quiz',
    question: 'Which RxJS operator combines the latest values from multiple streams?',
    score: (score, shots) => `Score ${score} / ${shots}`,
    statusIdle: 'Pull the string and release.',
    statusAim: 'Hold, aim, release.',
    statusAway: 'Arrow away.',
    statusCorrect: 'Correct hit. Nice release.',
    statusWrong: (answer) => `Hit ${answer}. Try the correct answer.`,
    progress: (current, total) => `Question ${current} of ${total}`,
    next: 'Next question',
    reset: 'Reset',
    answerLabel: (index) => `Answer ${index}`,
    hint: 'Drag backward from the bowstring, aim toward an answer target, then release. More pull gives more arrow speed and a flatter shot.',
    languageLabel: 'Language',
    aimHintLabel: 'Aim hint',
    revealAnswersLabel: 'Reveal answers',
    hideAnswersLabel: 'Hide answers',
    hintButtonLabel: 'Hint',
  },
  pl: {
    title: 'Łukowy quiz',
    question: 'Który operator RxJS łączy najnowsze wartości z wielu strumieni?',
    score: (score, shots) => `Wynik ${score} / ${shots}`,
    statusIdle: 'Naciągnij cięciwę i puść.',
    statusAim: 'Przytrzymaj, wyceluj, puść.',
    statusAway: 'Strzała leci.',
    statusCorrect: 'Trafienie poprawne. Dobry strzał.',
    statusWrong: (answer) => `Trafiono ${answer}. Spróbuj wskazać poprawną odpowiedź.`,
    reset: 'Reset',
    answerLabel: (index) => `Odpowiedź ${index}`,
    hint: 'Przeciągnij cięciwę do tyłu, wyceluj w tarczę z odpowiedzią i puść. Mocniejsze naciągnięcie daje większą prędkość i bardziej płaski lot strzały.',
    languageLabel: 'Język',
  },
  es: {
    title: 'Quiz con arco',
    question: '¿Qué operador de RxJS combina los valores más recientes de varios flujos?',
    score: (score, shots) => `Puntuación ${score} / ${shots}`,
    statusIdle: 'Tira de la cuerda y suelta.',
    statusAim: 'Mantén, apunta y suelta.',
    statusAway: 'Flecha lanzada.',
    statusCorrect: 'Impacto correcto. Buen lanzamiento.',
    statusWrong: (answer) => `Has dado en ${answer}. Prueba con la respuesta correcta.`,
    reset: 'Reiniciar',
    answerLabel: (index) => `Respuesta ${index}`,
    hint: 'Arrastra la cuerda hacia atrás, apunta a una diana de respuesta y suelta. Más tensión da más velocidad y un disparo más plano.',
    languageLabel: 'Idioma',
  },
  de: {
    title: 'Bogen-Quiz',
    question: 'Welcher RxJS-Operator kombiniert die neuesten Werte aus mehreren Streams?',
    score: (score, shots) => `Punkte ${score} / ${shots}`,
    statusIdle: 'Ziehe die Sehne und lass los.',
    statusAim: 'Halten, zielen, loslassen.',
    statusAway: 'Pfeil unterwegs.',
    statusCorrect: 'Richtig getroffen. Schöner Schuss.',
    statusWrong: (answer) => `${answer} getroffen. Versuche die richtige Antwort.`,
    reset: 'Zurücksetzen',
    answerLabel: (index) => `Antwort ${index}`,
    hint: 'Ziehe die Bogensehne zurück, ziele auf eine Antwortscheibe und lass los. Mehr Zug gibt dem Pfeil mehr Geschwindigkeit und eine flachere Flugbahn.',
    languageLabel: 'Sprache',
  },
  ca: {
    title: 'Quiz amb arc',
    question: 'Quin operador de RxJS combina els valors més recents de diversos fluxos?',
    score: (score, shots) => `Puntuació ${score} / ${shots}`,
    statusIdle: 'Estira la corda i deixa-la anar.',
    statusAim: 'Mantén, apunta i deixa anar.',
    statusAway: 'Fletxa llançada.',
    statusCorrect: 'Impacte correcte. Bon llançament.',
    statusWrong: (answer) => `Has encertat ${answer}. Prova la resposta correcta.`,
    reset: 'Reinicia',
    answerLabel: (index) => `Resposta ${index}`,
    hint: 'Arrossega la corda cap enrere, apunta a una diana de resposta i deixa anar. Més tensió dona més velocitat i un tir més pla.',
    languageLabel: 'Idioma',
  },
  pt: {
    title: 'Quiz com arco',
    question: 'Qual operador RxJS combina os valores mais recentes de vários fluxos?',
    score: (score, shots) => `Pontuação ${score} / ${shots}`,
    statusIdle: 'Puxe a corda e solte.',
    statusAim: 'Segure, mire e solte.',
    statusAway: 'Flecha lançada.',
    statusCorrect: 'Acerto correto. Bom disparo.',
    statusWrong: (answer) => `Acertou ${answer}. Tente a resposta correta.`,
    reset: 'Reiniciar',
    answerLabel: (index) => `Resposta ${index}`,
    hint: 'Arraste a corda para trás, mire em um alvo de resposta e solte. Mais força dá mais velocidade à flecha e um disparo mais plano.',
    languageLabel: 'Idioma',
  },
  fr: {
    title: 'Quiz à l’arc',
    question: 'Quel opérateur RxJS combine les dernières valeurs de plusieurs flux ?',
    score: (score, shots) => `Score ${score} / ${shots}`,
    statusIdle: 'Tirez la corde puis relâchez.',
    statusAim: 'Maintenez, visez, relâchez.',
    statusAway: 'Flèche lancée.',
    statusCorrect: 'Bonne cible. Beau tir.',
    statusWrong: (answer) => `Vous avez touché ${answer}. Essayez la bonne réponse.`,
    reset: 'Réinitialiser',
    answerLabel: (index) => `Réponse ${index}`,
    hint: 'Tirez la corde vers l’arrière, visez une cible de réponse, puis relâchez. Plus la tension est forte, plus la flèche est rapide et le tir plat.',
    languageLabel: 'Langue',
  },
  it: {
    title: 'Quiz con arco',
    question: 'Quale operatore RxJS combina gli ultimi valori di più stream?',
    score: (score, shots) => `Punteggio ${score} / ${shots}`,
    statusIdle: 'Tira la corda e rilascia.',
    statusAim: 'Tieni, mira e rilascia.',
    statusAway: 'Freccia scoccata.',
    statusCorrect: 'Bersaglio corretto. Bel rilascio.',
    statusWrong: (answer) => `Hai colpito ${answer}. Prova la risposta corretta.`,
    reset: 'Reimposta',
    answerLabel: (index) => `Risposta ${index}`,
    hint: 'Trascina indietro la corda, mira a un bersaglio di risposta e rilascia. Più trazione dà più velocità alla freccia e un tiro più piatto.',
    languageLabel: 'Lingua',
  },
  zh: {
    title: '射箭测验',
    question: '哪个 RxJS 操作符会组合多个流中的最新值？',
    score: (score, shots) => `得分 ${score} / ${shots}`,
    statusIdle: '拉弦，然后释放。',
    statusAim: '保持、瞄准、释放。',
    statusAway: '箭已射出。',
    statusCorrect: '命中正确答案。释放得不错。',
    statusWrong: (answer) => `命中 ${answer}。请尝试正确答案。`,
    reset: '重置',
    answerLabel: (index) => `答案 ${index}`,
    hint: '向后拖动弓弦，瞄准一个答案靶，然后释放。拉得越满，箭速越快，弹道越平。',
    languageLabel: '语言',
  },
  ru: {
    title: 'Лучный квиз',
    question: 'Какой оператор RxJS объединяет последние значения из нескольких потоков?',
    score: (score, shots) => `Счёт ${score} / ${shots}`,
    statusIdle: 'Натяните тетиву и отпустите.',
    statusAim: 'Удерживайте, цельтесь, отпускайте.',
    statusAway: 'Стрела выпущена.',
    statusCorrect: 'Верное попадание. Отличный выпуск.',
    statusWrong: (answer) => `Попадание в ${answer}. Попробуйте правильный ответ.`,
    reset: 'Сброс',
    answerLabel: (index) => `Ответ ${index}`,
    hint: 'Потяните тетиву назад, прицельтесь в мишень с ответом и отпустите. Чем сильнее натяжение, тем быстрее стрела и тем ровнее полёт.',
    languageLabel: 'Язык',
  },
};

const WORLD_WIDTH = 1000;
const WORLD_HEIGHT = 560;
const BOW_ANCHOR = { x: 148, y: 306 };
const MAX_PULL = 150;
const ARROW_LENGTH = 72;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function maskAnswerText(text) {
  return text.replace(/\S/g, '•');
}

/** Answers start masked; `answersRevealed` unmasks all of them at once, while
 * `hintLettersRevealed` progressively unmasks just the correct answer's leading letters
 * without giving away the wrong ones. A target that was already hit always shows its real
 * text, since the player just found out empirically which one it is. */
function getDisplayedAnswerText(answer, { answersRevealed, hintLettersRevealed, wasHit }) {
  if (answersRevealed || wasHit) {
    return answer.text;
  }
  if (answer.correct && hintLettersRevealed > 0) {
    return answer.text.slice(0, hintLettersRevealed) + maskAnswerText(answer.text.slice(hintLettersRevealed));
  }
  return maskAnswerText(answer.text);
}

function normalize(vector) {
  const length = Math.hypot(vector.x, vector.y) || 1;
  return { x: vector.x / length, y: vector.y / length };
}

function rotatePoint(x, y, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos,
  };
}

function toViewPoint(point, rect) {
  return {
    x: (point.x / rect.width) * WORLD_WIDTH,
    y: (point.y / rect.height) * WORLD_HEIGHT,
  };
}

function getTargetLayout(index, answerCount) {
  const spacing = WORLD_HEIGHT / (answerCount + 1);
  return {
    x: 700,
    y: spacing * (index + 1),
    width: 280,
    height: 66,
  };
}

function normalizeLocale(locale) {
  const primary = String(locale || '').toLowerCase().split('-')[0];
  if (primary === 'zh' || primary === 'cmn') {
    return 'zh';
  }
  if (primary === 'ita') {
    return 'it';
  }
  return LOCALES.some((item) => item.code === primary) ? primary : 'en';
}

function getInitialLocale() {
  const params = new URLSearchParams(window.location.search);
  return normalizeLocale(
    params.get('lang')
      || window.localStorage.getItem('bowQuizLocale')
      || window.navigator.language,
  );
}

function getStatusText(status, copy) {
  switch (status.type) {
    case 'aim':
      return copy.statusAim;
    case 'away':
      return copy.statusAway;
    case 'correct':
      return copy.statusCorrect;
    case 'wrong':
      return copy.statusWrong(status.answerText);
    case 'idle':
    default:
      return copy.statusIdle;
  }
}

function getStatusKind(status) {
  if (status.type === 'correct') {
    return 'correct';
  }
  if (status.type === 'wrong') {
    return 'wrong';
  }
  return '';
}

function makeArrow(startPoint, aimVector, pullDistance) {
  const direction = normalize({
    x: -aimVector.x,
    y: -aimVector.y,
  });
  const angle = Math.atan2(direction.y, direction.x);
  const arrow = Bodies.rectangle(
    startPoint.x + direction.x * 38,
    startPoint.y + direction.y * 38,
    ARROW_LENGTH,
    6,
    {
      frictionAir: 0.012,
      density: 0.003,
      restitution: 0.08,
      label: 'arrow',
    },
  );
  Body.setAngle(arrow, angle);
  Body.setVelocity(arrow, {
    x: direction.x * pullDistance * 0.27,
    y: direction.y * pullDistance * 0.27,
  });
  arrow.plugin = {
    ...arrow.plugin,
    stuck: false,
  };
  return arrow;
}

function ArrowShape({ arrow }) {
  const angle = arrow.angle;
  const toPoint = (localX, localY) => {
    const p = rotatePoint(localX, localY, angle);
    return `${arrow.position.x + p.x},${arrow.position.y + p.y}`;
  };

  const tail = rotatePoint(-ARROW_LENGTH / 2, 0, angle);
  const head = rotatePoint(ARROW_LENGTH / 2, 0, angle);
  const headTop = rotatePoint(ARROW_LENGTH / 2 - 10, -8, angle);
  const headBottom = rotatePoint(ARROW_LENGTH / 2 - 10, 8, angle);

  // Fletching (feathers): two vanes flaring outward past the tail, each attached to the shaft
  // well forward of the tail tip - NOT a single triangle converging to a point at the tail, which
  // reads as a second arrowhead (GH: "arrow should have a point on only one end").
  const vaneFront = -ARROW_LENGTH / 2 + 16;
  const vaneBack = -ARROW_LENGTH / 2 + 4;
  const vaneTip = -ARROW_LENGTH / 2 - 2;

  return React.createElement(
    'g',
    null,
    React.createElement('line', {
      className: 'arrow-body',
      x1: arrow.position.x + tail.x,
      y1: arrow.position.y + tail.y,
      x2: arrow.position.x + head.x,
      y2: arrow.position.y + head.y,
    }),
    React.createElement('polygon', {
      className: 'arrow-head',
      points: [
        `${arrow.position.x + head.x},${arrow.position.y + head.y}`,
        `${arrow.position.x + headTop.x},${arrow.position.y + headTop.y}`,
        `${arrow.position.x + headBottom.x},${arrow.position.y + headBottom.y}`,
      ].join(' '),
    }),
    React.createElement('polygon', {
      className: 'fletching',
      points: [toPoint(vaneFront, -1.5), toPoint(vaneBack, -1.5), toPoint(vaneTip, -9)].join(' '),
    }),
    React.createElement('polygon', {
      className: 'fletching',
      points: [toPoint(vaneFront, 1.5), toPoint(vaneBack, 1.5), toPoint(vaneTip, 9)].join(' '),
    }),
  );
}

function Target({ answer, answerCount, copy, index, hitAnswerId, answersRevealed, hintLettersRevealed }) {
  const layout = getTargetLayout(index, answerCount);
  const wasHit = hitAnswerId === answer.id;
  const displayedText = getDisplayedAnswerText(answer, { answersRevealed, hintLettersRevealed, wasHit });
  const className = [
    'target-card',
    wasHit && answer.correct ? 'hit' : '',
    wasHit && !answer.correct ? 'wrong-hit' : '',
  ].filter(Boolean).join(' ');

  return React.createElement(
    'g',
    { className },
    React.createElement('rect', {
      className: 'target-back',
      x: layout.x,
      y: layout.y - layout.height / 2,
      width: layout.width,
      height: layout.height,
      rx: 8,
    }),
    React.createElement('circle', {
      className: 'target-ring-outer',
      cx: layout.x + 31,
      cy: layout.y,
      r: 21,
    }),
    React.createElement('circle', {
      className: 'target-ring-middle',
      cx: layout.x + 31,
      cy: layout.y,
      r: 13,
    }),
    React.createElement('circle', {
      className: 'target-ring-inner',
      cx: layout.x + 31,
      cy: layout.y,
      r: 5,
    }),
    React.createElement('text', {
      className: 'target-label',
      x: layout.x + 62,
      y: layout.y - 4,
    }, `${answer.label}. ${displayedText}`),
    React.createElement('text', {
      className: 'target-sub-label',
      x: layout.x + 62,
      y: layout.y + 15,
    }, copy.answerLabel(index + 1)),
  );
}

function Bow({ pullPoint, pullDistance }) {
  const stringPoint = pullPoint || BOW_ANCHOR;
  const bend = pullDistance * 0.27;
  // Targets sit to the right of the bow (getTargetLayout: x: 700, vs. BOW_ANCHOR.x: 148) - the
  // wood limb (upperControl/lowerControl, the curve's bulge) needs to bulge toward that side (a
  // bow's convex "back" faces the target, its concave "belly"/string faces the archer), so tips
  // sit left of the anchor and the control points sit right of it.
  const topTip = { x: BOW_ANCHOR.x - 18, y: BOW_ANCHOR.y - 116 };
  const bottomTip = { x: BOW_ANCHOR.x - 18, y: BOW_ANCHOR.y + 116 };
  const upperControl = { x: BOW_ANCHOR.x + 42 + bend, y: BOW_ANCHOR.y - 60 };
  const lowerControl = { x: BOW_ANCHOR.x + 42 + bend, y: BOW_ANCHOR.y + 60 };

  return React.createElement(
    'g',
    null,
    React.createElement('path', {
      className: 'bow-limb',
      d: `M ${topTip.x} ${topTip.y} Q ${upperControl.x} ${upperControl.y} ${BOW_ANCHOR.x} ${BOW_ANCHOR.y} Q ${lowerControl.x} ${lowerControl.y} ${bottomTip.x} ${bottomTip.y}`,
    }),
    React.createElement('path', {
      className: 'bow-string',
      d: `M ${topTip.x} ${topTip.y} L ${stringPoint.x} ${stringPoint.y} L ${bottomTip.x} ${bottomTip.y}`,
    }),
    React.createElement('rect', {
      className: 'bow-grip',
      x: BOW_ANCHOR.x - 8,
      y: BOW_ANCHOR.y - 34,
      width: 16,
      height: 68,
      rx: 7,
    }),
  );
}

function AimPreview({ pullPoint, showAimHint }) {
  if (!pullPoint) {
    return null;
  }
  const pullVector = {
    x: pullPoint.x - BOW_ANCHOR.x,
    y: pullPoint.y - BOW_ANCHOR.y,
  };
  const pullDistance = clamp(distance(pullPoint, BOW_ANCHOR), 0, MAX_PULL);
  const direction = normalize({ x: -pullVector.x, y: -pullVector.y });
  const arrowTail = {
    x: pullPoint.x - direction.x * 20,
    y: pullPoint.y - direction.y * 20,
  };
  const arrowHead = {
    x: pullPoint.x + direction.x * 72,
    y: pullPoint.y + direction.y * 72,
  };
  const dots = Array.from({ length: 8 }, (_, index) => {
    const t = index + 1;
    return {
      x: BOW_ANCHOR.x + direction.x * pullDistance * 0.58 * t,
      y: BOW_ANCHOR.y + direction.y * pullDistance * 0.58 * t + 0.9 * t * t,
    };
  });

  return React.createElement(
    'g',
    null,
    React.createElement('line', {
      className: 'bow-arrow-preview',
      x1: arrowTail.x,
      y1: arrowTail.y,
      x2: arrowHead.x,
      y2: arrowHead.y,
    }),
    showAimHint && dots.map((dot, index) => React.createElement('circle', {
      key: index,
      className: 'trajectory-dot',
      cx: dot.x,
      cy: dot.y,
      r: Math.max(2, 4 - index * 0.22),
    })),
  );
}

function BowQuizGame() {
  const svgRef = React.useRef(null);
  const engineRef = React.useRef(null);
  const targetBodiesRef = React.useRef(new Map());
  const correctAwardedRef = React.useRef(false);
  const [questions] = React.useState(loadQuestions);
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const currentQuestion = questions[questionIndex];
  const answers = currentQuestion.answers;
  const [locale, setLocale] = React.useState(getInitialLocale);
  const [showAimHint, setShowAimHint] = React.useState(
    () => window.localStorage.getItem('bowQuizShowAimHint') !== 'false',
  );
  const [answersRevealed, setAnswersRevealed] = React.useState(true);
  const [hintLettersRevealed, setHintLettersRevealed] = React.useState(0);
  const [arrows, setArrows] = React.useState([]);
  const [pullPoint, setPullPoint] = React.useState(null);
  const [hitAnswerId, setHitAnswerId] = React.useState('');
  const [shots, setShots] = React.useState(0);
  const [score, setScore] = React.useState(0);
  const [status, setStatus] = React.useState({ type: 'idle' });
  const copy = TRANSLATIONS[locale] || TRANSLATIONS.en;
  const statusKind = getStatusKind(status);

  React.useEffect(() => {
    const engine = Engine.create({
      gravity: { x: 0, y: 0.45, scale: 0.001 },
    });
    engineRef.current = engine;

    const ground = Bodies.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT + 28, WORLD_WIDTH, 54, {
      isStatic: true,
      label: 'ground',
    });
    Composite.add(engine.world, ground);

    const targetBodies = new Map();
    answers.forEach((answer, index) => {
      const layout = getTargetLayout(index, answers.length);
      const body = Bodies.rectangle(layout.x + layout.width / 2, layout.y, layout.width, layout.height, {
        isStatic: true,
        isSensor: true,
        label: `target:${answer.id}`,
      });
      body.plugin = { answerId: answer.id };
      targetBodies.set(answer.id, body);
      Composite.add(engine.world, body);
    });
    targetBodiesRef.current = targetBodies;

    Events.on(engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        const bodies = [pair.bodyA, pair.bodyB];
        const arrow = bodies.find((body) => body.label === 'arrow');
        const target = bodies.find((body) => body.label.startsWith('target:'));
        if (!arrow || !target || arrow.plugin?.stuck) {
          continue;
        }
        const answer = answers.find((candidate) => candidate.id === target.plugin.answerId);
        if (!answer) {
          continue;
        }
        arrow.plugin.stuck = true;
        Body.setVelocity(arrow, { x: 0, y: 0 });
        Body.setAngularVelocity(arrow, 0);
        Body.setStatic(arrow, true);
        setHitAnswerId(answer.id);
        setStatus(answer.correct ? { type: 'correct' } : { type: 'wrong', answerText: answer.text });
        if (answer.correct && !correctAwardedRef.current) {
          correctAwardedRef.current = true;
          setScore((value) => value + 1);
        }
      }
    });

    let frameId = 0;
    let previousTime = performance.now();
    function tick(now) {
      const delta = clamp(now - previousTime, 0, 32);
      previousTime = now;
      Engine.update(engine, delta);
      setArrows(Composite.allBodies(engine.world)
        .filter((body) => body.label === 'arrow')
        .filter((body) => body.position.x > -140 && body.position.x < WORLD_WIDTH + 180 && body.position.y < WORLD_HEIGHT + 160)
        .map((body) => ({
          id: body.id,
          position: { ...body.position },
          angle: body.angle,
        })));
      frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      Engine.clear(engine);
      Composite.clear(engine.world, false);
      engineRef.current = null;
    };
  }, [answers]);

  React.useEffect(() => {
    document.documentElement.lang = locale;
    document.title = copy.title;
    window.localStorage.setItem('bowQuizLocale', locale);
  }, [copy.title, locale]);

  const pullDistance = pullPoint ? clamp(distance(pullPoint, BOW_ANCHOR), 0, MAX_PULL) : 0;
  const questionComplete = Boolean(hitAnswerId && answers.find(answer => answer.id === hitAnswerId)?.correct);

  function getPointerWorldPoint(event) {
    const rect = svgRef.current.getBoundingClientRect();
    return toViewPoint({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }, rect);
  }

  function updatePull(event) {
    event.preventDefault();
    if (!svgRef.current) {
      return;
    }
    const point = getPointerWorldPoint(event);
    const rawVector = {
      x: point.x - BOW_ANCHOR.x,
      y: point.y - BOW_ANCHOR.y,
    };
    const rawDistance = distance(point, BOW_ANCHOR);
    const limitedDistance = clamp(rawDistance, 0, MAX_PULL);
    const direction = normalize(rawVector);
    setPullPoint({
      x: BOW_ANCHOR.x + direction.x * limitedDistance,
      y: BOW_ANCHOR.y + direction.y * limitedDistance,
    });
  }

  function startPull(event) {
    event.preventDefault();
    if (questionComplete) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setStatus({ type: 'aim' });
    updatePull(event);
  }

  function releaseArrow() {
    if (!pullPoint || pullDistance < 16 || !engineRef.current) {
      setPullPoint(null);
      return;
    }

    const pullVector = {
      x: pullPoint.x - BOW_ANCHOR.x,
      y: pullPoint.y - BOW_ANCHOR.y,
    };
    const arrow = makeArrow(BOW_ANCHOR, pullVector, pullDistance);
    Composite.add(engineRef.current.world, arrow);
    setShots((value) => value + 1);
    setPullPoint(null);
    setStatus({ type: 'away' });
  }

  function resetGame() {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }
    Composite.allBodies(engine.world)
      .filter((body) => body.label === 'arrow')
      .forEach((body) => Composite.remove(engine.world, body));
    setArrows([]);
    setHitAnswerId('');
    setShots(0);
    setScore(0);
    setStatus({ type: 'idle' });
    setPullPoint(null);
    setAnswersRevealed(true);
    setHintLettersRevealed(0);
    correctAwardedRef.current = false;
    setQuestionIndex(0);
  }

  function nextQuestion() {
    const engine = engineRef.current;
    if (engine) {
      Composite.allBodies(engine.world)
        .filter((body) => body.label === 'arrow')
        .forEach((body) => Composite.remove(engine.world, body));
    }
    setArrows([]);
    setHitAnswerId('');
    setStatus({ type: 'idle' });
    setPullPoint(null);
    setHintLettersRevealed(0);
    setAnswersRevealed(true);
    correctAwardedRef.current = false;
    setQuestionIndex((value) => Math.min(value + 1, questions.length - 1));
  }

  function changeLocale(event) {
    setLocale(normalizeLocale(event.target.value));
  }

  function toggleAnswersRevealed() {
    setAnswersRevealed((value) => !value);
  }

  function revealNextHintLetter() {
    const correctAnswer = answers.find((answer) => answer.correct);
    if (!correctAnswer) {
      return;
    }
    setHintLettersRevealed((value) => Math.min(value + 1, correctAnswer.text.length));
  }

  function toggleAimHint(event) {
    const next = event.target.checked;
    setShowAimHint(next);
    window.localStorage.setItem('bowQuizShowAimHint', String(next));
  }

  return React.createElement(
    'main',
    { className: 'game-shell' },
    React.createElement(
      'header',
      { className: 'game-header' },
      React.createElement(
        'div',
        { className: 'question-block' },
        React.createElement('div', { className: 'question-kicker' }, `${copy.title} · ${(copy.progress || TRANSLATIONS.en.progress)(questionIndex + 1, questions.length)}`),
        React.createElement('div', { className: 'question-text' }, currentQuestion.question),
      ),
      React.createElement('div', { className: 'score-pill' }, copy.score(score, shots || 0)),
      React.createElement('div', { className: `status-pill ${statusKind}` }, getStatusText(status, copy)),
      React.createElement(
        'label',
        { className: 'language-select-wrap' },
        React.createElement('span', null, copy.languageLabel),
        React.createElement(
          'select',
          {
            className: 'language-select',
            value: locale,
            onChange: changeLocale,
            'aria-label': copy.languageLabel,
          },
          LOCALES.map((item) => React.createElement('option', {
            key: item.code,
            value: item.code,
          }, item.label)),
        ),
      ),
      React.createElement(
        'label',
        { className: 'aim-hint-toggle-wrap' },
        React.createElement('input', {
          type: 'checkbox',
          checked: showAimHint,
          onChange: toggleAimHint,
        }),
        React.createElement('span', null, copy.aimHintLabel || TRANSLATIONS.en.aimHintLabel),
      ),
      React.createElement('button', { type: 'button', className: 'reset-button', onClick: resetGame }, copy.reset),
    ),
    React.createElement(
      'section',
      { className: 'game-stage' },
      React.createElement(
        'svg',
        {
          ref: svgRef,
          className: 'aim-layer',
          viewBox: `0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`,
          onPointerDown: startPull,
          onPointerMove: (event) => pullPoint && updatePull(event),
          onPointerUp: releaseArrow,
          onPointerCancel: () => setPullPoint(null),
        },
        React.createElement('rect', { x: 0, y: WORLD_HEIGHT - 52, width: WORLD_WIDTH, height: 52, fill: 'rgba(115, 157, 115, 0.22)' }),
        answers.map((answer, index) => React.createElement(Target, {
          key: answer.id,
          answer,
          answerCount: answers.length,
          copy,
          index,
          hitAnswerId,
          answersRevealed,
          hintLettersRevealed,
        })),
        React.createElement(AimPreview, { pullPoint, showAimHint }),
        React.createElement(Bow, { pullPoint, pullDistance }),
        React.createElement('rect', {
          className: 'pull-meter-track',
          x: 46,
          y: 470,
          width: 210,
          height: 14,
          rx: 7,
        }),
        React.createElement('rect', {
          className: 'pull-meter-fill',
          x: 46,
          y: 470,
          width: 210 * (pullDistance / MAX_PULL),
          height: 14,
          rx: 7,
        }),
        arrows.map((arrow) => React.createElement(ArrowShape, {
          key: arrow.id,
          arrow,
        })),
      ),
      React.createElement(
        'div',
        { className: 'hint-line' },
        copy.hint,
      ),
      React.createElement(
        'div',
        { className: 'answer-controls' },
        answers.map((answer) => React.createElement(
          'button',
          {
            key: answer.id,
            type: 'button',
            className: 'answer-control-button keyboard-answer',
            disabled: questionComplete,
            onClick: () => {
              setShots((value) => value + 1);
              setHitAnswerId(answer.id);
              setStatus(answer.correct ? { type: 'correct' } : { type: 'wrong', answerText: answer.text });
              if (answer.correct && !correctAwardedRef.current) {
                correctAwardedRef.current = true;
                setScore((value) => value + 1);
              }
            },
            'aria-label': `${answer.label}. ${answer.text}`,
          },
          answer.label,
        )),
        React.createElement(
          'button',
          { type: 'button', className: 'answer-control-button', onClick: toggleAnswersRevealed },
          answersRevealed
            ? (copy.hideAnswersLabel || TRANSLATIONS.en.hideAnswersLabel)
            : (copy.revealAnswersLabel || TRANSLATIONS.en.revealAnswersLabel),
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            className: 'answer-control-button',
            onClick: revealNextHintLetter,
            disabled: answersRevealed || hintLettersRevealed >= (answers.find((answer) => answer.correct)?.text.length ?? 0),
          },
          copy.hintButtonLabel || TRANSLATIONS.en.hintButtonLabel,
        ),
        hitAnswerId && answers.find(answer => answer.id === hitAnswerId)?.correct && questionIndex < questions.length - 1
          ? React.createElement('button', { type: 'button', className: 'answer-control-button next-button', onClick: nextQuestion }, copy.next || TRANSLATIONS.en.next)
          : null,
      ),
    ),
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(React.createElement(BowQuizGame));
}
