import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchBank, getLastAttemptQuestionIds, saveAttempt } from '../teoriprov/api';
import { generateExam, gradeExam, EXAM_SECONDS, CATEGORY_LABELS } from '../teoriprov/engine';

const STORAGE_KEY = 'tp-exam-inprogress';
const FLOW_VERSION = 2;

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TeoriProvRun() {
  const { user } = useAuth();

  const [stage, setStage] = useState('loading'); // loading | exam | result
  const [exam, setExam] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(EXAM_SECONDS);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showReview, setShowReview] = useState(false);
  const submittingRef = useRef(false);
  const answersRef = useRef({});
  const questionTitleRef = useRef(null);

  const persist = useCallback((data) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, flowVersion: FLOW_VERSION }));
    } catch {
      /* تجاهل أخطاء التخزين المحلي (مثل وضع التصفح الخاص) دون كسر الاختبار */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          if (saved.userId === user.uid && Array.isArray(saved.exam) && saved.exam.length > 0) {
            const elapsed = Math.floor((Date.now() - saved.startTime) / 1000);
            if (elapsed >= 0 && elapsed < EXAM_SECONDS) {
              const restoredAnswers = {};
              saved.exam.forEach((question) => {
                const selected = saved.answers?.[question.id];
                if (Number.isInteger(selected) && selected >= 0 && selected < question.options.length) {
                  restoredAnswers[question.id] = selected;
                }
              });
              const firstUnanswered = saved.exam.findIndex((question) => restoredAnswers[question.id] === undefined);
              const resumeIndex = firstUnanswered === -1 ? saved.exam.length - 1 : firstUnanswered;
              const savedIndex = saved.flowVersion === FLOW_VERSION && Number.isInteger(saved.currentIndex)
                ? Math.max(0, Math.min(saved.currentIndex, resumeIndex))
                : resumeIndex;
              setExam(saved.exam);
              answersRef.current = restoredAnswers;
              setAnswers(restoredAnswers);
              setCurrentIndex(savedIndex);
              setStartTime(saved.startTime);
              setSecondsLeft(EXAM_SECONDS - elapsed);
              persist({ userId: user.uid, exam: saved.exam, answers: restoredAnswers, currentIndex: savedIndex, startTime: saved.startTime });
              setStage('exam');
              return;
            }
          }
        } catch {
          /* بيانات محفوظة تالفة، نتجاهلها ونولّد اختبارًا جديدًا */
        }
        sessionStorage.removeItem(STORAGE_KEY);
      }

      try {
        const [bank, recentIds] = await Promise.all([fetchBank(), getLastAttemptQuestionIds(user.uid)]);
        if (cancelled) return;
        const generated = generateExam(bank, recentIds);
        const now = Date.now();
        setExam(generated);
        setStartTime(now);
        setSecondsLeft(EXAM_SECONDS);
        persist({ userId: user.uid, exam: generated, answers: {}, currentIndex: 0, startTime: now });
        setStage('exam');
      } catch {
        if (!cancelled) setError('تعذّر تحميل بنك الأسئلة. حاول مرة أخرى.');
      }
    }

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = useCallback(
    async () => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      const durationUsed = Math.min(EXAM_SECONDS, Math.max(0, Math.floor((Date.now() - startTime) / 1000)));
      const graded = gradeExam(exam, answersRef.current);
      setSecondsLeft(EXAM_SECONDS - durationUsed);
      setResult(graded);
      setStage('result');
      sessionStorage.removeItem(STORAGE_KEY);
      try {
        await saveAttempt(user, graded, durationUsed);
      } catch {
        /* فشل حفظ النتيجة بالخادم لا يجب أن يمنع المستخدم من رؤية نتيجته محليًا */
      }
    },
    [exam, startTime, user]
  );

  // Keep the deadline accurate when the tab is suspended, without restarting the timer on answers.
  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;

  useEffect(() => {
    if (stage !== 'exam') return undefined;
    const interval = setInterval(() => {
      const remaining = Math.max(0, EXAM_SECONDS - Math.floor((Date.now() - startTime) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        handleSubmitRef.current();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [stage, startTime]);

  useEffect(() => {
    if (stage !== 'exam') return;
    questionTitleRef.current?.focus({ preventScroll: true });
    if (currentIndex > 0) questionTitleRef.current?.scrollIntoView({ block: 'start' });
  }, [stage, currentIndex]);

  const selectAnswer = (qid, optionIndex) => {
    if (submittingRef.current || answersRef.current[qid] !== undefined || exam[currentIndex]?.id !== qid) return;
    if (Date.now() - startTime >= EXAM_SECONDS * 1000) {
      handleSubmit();
      return;
    }
    const next = { ...answersRef.current, [qid]: optionIndex };
    answersRef.current = next;
    setAnswers(next);
    persist({ userId: user.uid, exam, answers: next, currentIndex, startTime });
  };

  const nextQuestion = () => {
    if (submittingRef.current || answersRef.current[exam[currentIndex]?.id] === undefined || currentIndex >= exam.length - 1) return;
    const nextIndex = currentIndex + 1;
    persist({ userId: user.uid, exam, answers: answersRef.current, currentIndex: nextIndex, startTime });
    setCurrentIndex(nextIndex);
  };

  const manualSubmit = () => {
    const unanswered = exam.length - Object.keys(answersRef.current).length;
    if (unanswered > 0) {
      const ok = window.confirm(`لديك ${unanswered} سؤالًا بدون إجابة. هل تريد إنهاء الاختبار الآن؟`);
      if (!ok) return;
    }
    handleSubmit();
  };

  if (error) return <div className="page error">{error}</div>;
  if (stage === 'loading') return <div className="page">جارِ تجهيز اختبار جديد...</div>;

  if (stage === 'result' && result) {
    const weakCats = Object.entries(result.categoryScores)
      .map(([cat, s]) => ({ cat, pct: s.total ? Math.round((s.correct / s.total) * 100) : 0 }))
      .filter((c) => c.pct < 70)
      .sort((a, b) => a.pct - b.pct);

    return (
      <div className="page">
        <h1>نتيجة محاكاة Teoriprov</h1>
        <div className={`tp-result-banner ${result.passed ? 'success' : 'warning'}`}>
          <div className="tp-result-score">{result.score} / {result.total}</div>
          <div>{result.passed ? '✅ ناجح' : '❌ غير ناجح'} — ({result.percentage}%)</div>
        </div>
        <p className="muted">الوقت المستخدم: {formatTime(EXAM_SECONDS - secondsLeft)} من {formatTime(EXAM_SECONDS)}</p>

        <h2>أداؤك حسب المجال</h2>
        <div className="table-scroll">
          <table className="results-table">
            <thead>
              <tr><th>المجال</th><th>النتيجة</th><th>النسبة</th></tr>
            </thead>
            <tbody>
              {Object.entries(result.categoryScores).map(([cat, s]) => (
                <tr key={cat}>
                  <td>{CATEGORY_LABELS[cat]}</td>
                  <td>{s.correct} / {s.total}</td>
                  <td>{s.total ? Math.round((s.correct / s.total) * 100) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {weakCats.length > 0 && (
          <p className="tp-recommendation">
            💡 تحتاج إلى مراجعة موضوعات: <strong>{weakCats.map((c) => CATEGORY_LABELS[c.cat]).join('، ')}</strong> قبل إعادة الاختبار.
          </p>
        )}

        <div className="hero-actions" style={{ margin: '20px 0' }}>
          <button className="btn-primary" onClick={() => setShowReview((v) => !v)}>
            {showReview ? 'إخفاء مراجعة الأسئلة' : 'مراجعة الأسئلة'}
          </button>
          <Link to="/teoriprov" className="btn-secondary">العودة للصفحة الرئيسية للاختبار</Link>
        </div>

        {showReview && (
          <div className="review-list">
            {result.questions.map((q, idx) => (
              <div key={q.id} className={`review-item ${q.isCorrect ? 'correct' : 'incorrect'}`}>
                <p className="review-question">
                  {idx + 1}. {q.text} {q.isTrial && <span className="tp-trial-tag">سؤال تجريبي غير محتسب</span>}
                </p>
                {q.imageUrl && <img src={q.imageUrl} alt={q.imageAlt || ''} className="tp-question-image" />}
                <p className="muted">المجال: {CATEGORY_LABELS[q.category]}</p>
                <p>إجابتك: {q.selectedIndex !== null ? q.options[q.selectedIndex] : 'لم تُجب'}</p>
                {!q.isCorrect && <p>الإجابة الصحيحة: {q.options[q.correctIndex]}</p>}
                <p className="explanation">💡 {q.explanation}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const q = exam[currentIndex];
  const selectedIndex = answers[q?.id];
  const isAnswered = selectedIndex !== undefined;
  const isCorrect = isAnswered && selectedIndex === q.correctIndex;

  return (
    <div className="page tp-exam-page tp-sequential-exam">
      <div className="tp-exam-header">
        <div className="tp-current-question">السؤال <strong>{currentIndex + 1}</strong> من {exam.length}</div>
        <div className={`tp-timer ${secondsLeft <= 300 ? 'tp-timer-danger' : ''}`} aria-label={`الوقت المتبقي ${formatTime(secondsLeft)}`}>
          <bdi>{formatTime(secondsLeft)}</bdi>
        </div>
      </div>

      {q && (
        <section className={`tp-live-question ${isAnswered ? (isCorrect ? 'is-correct' : 'is-incorrect') : ''}`} aria-labelledby="tp-question-title">
          <div className="tp-live-question-heading">
            <h1 id="tp-question-title" ref={questionTitleRef} tabIndex={-1}>{q.text}</h1>
          </div>
          {q.imageUrl && <img src={q.imageUrl} alt={q.imageAlt || ''} className="tp-question-image tp-live-question-image" />}
          <fieldset className="tp-live-options" disabled={isAnswered} aria-labelledby="tp-question-title">
            {q.options.map((opt, i) => {
              const correctOption = isAnswered && i === q.correctIndex;
              const incorrectOption = isAnswered && i === selectedIndex && !isCorrect;
              return (
                <label key={`${q.id}-${i}`} className={`tp-answer-option ${correctOption ? 'is-correct' : ''} ${incorrectOption ? 'is-incorrect' : ''}`}>
                  <input
                    type="radio"
                    name={q.id}
                    aria-label={opt}
                    checked={selectedIndex === i}
                    onChange={() => selectAnswer(q.id, i)}
                  />
                  <span className="tp-answer-text">{opt}</span>
                  {(correctOption || incorrectOption) && (
                    <span className="tp-answer-status">{correctOption ? 'الإجابة الصحيحة' : 'إجابتك'}</span>
                  )}
                </label>
              );
            })}
          </fieldset>
          <p className="tp-answer-feedback" role="status">
            {isAnswered ? (isCorrect ? 'إجابة صحيحة' : 'إجابة غير صحيحة') : ''}
          </p>
        </section>
      )}

      <div className="tp-exam-nav">
        {currentIndex < exam.length - 1 ? (
          <button type="button" className="btn-primary" disabled={!isAnswered} onClick={nextQuestion}>
            السؤال التالي
          </button>
        ) : (
          <button type="button" className="btn-primary" disabled={!isAnswered} onClick={manualSubmit}>
            إنهاء الاختبار
          </button>
        )}
      </div>

      <button type="button" className="link-btn tp-force-submit" onClick={manualSubmit}>
        إنهاء الاختبار الآن
      </button>
    </div>
  );
}
