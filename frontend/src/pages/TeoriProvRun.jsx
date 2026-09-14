import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchBank, getLastAttemptQuestionIds, saveAttempt } from '../teoriprov/api';
import { generateExam, gradeExam, EXAM_SECONDS, TOTAL_QUESTIONS, CATEGORY_LABELS } from '../teoriprov/engine';

const STORAGE_KEY = 'tp-exam-inprogress';

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TeoriProvRun() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stage, setStage] = useState('loading'); // loading | exam | result
  const [exam, setExam] = useState([]);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(EXAM_SECONDS);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showReview, setShowReview] = useState(false);
  const submittingRef = useRef(false);

  const persist = useCallback((data) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
          if (saved.userId === user.uid) {
            const elapsed = Math.floor((Date.now() - saved.startTime) / 1000);
            if (elapsed < EXAM_SECONDS) {
              setExam(saved.exam);
              setAnswers(saved.answers || {});
              setFlagged(new Set(saved.flagged || []));
              setStartTime(saved.startTime);
              setSecondsLeft(EXAM_SECONDS - elapsed);
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
        persist({ userId: user.uid, exam: generated, answers: {}, flagged: [], startTime: now });
        setStage('exam');
      } catch (e) {
        setError('تعذّر تحميل بنك الأسئلة. حاول مرة أخرى.');
      }
    }

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = useCallback(
    async (auto = false) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      const durationUsed = EXAM_SECONDS - secondsLeft;
      const graded = gradeExam(exam, answers);
      setResult(graded);
      setStage('result');
      sessionStorage.removeItem(STORAGE_KEY);
      try {
        await saveAttempt(user, graded, durationUsed);
      } catch {
        /* فشل حفظ النتيجة بالخادم لا يجب أن يمنع المستخدم من رؤية نتيجته محليًا */
      }
    },
    [exam, answers, secondsLeft, user]
  );

  // مرجع ثابت لآخر نسخة من handleSubmit: يمنع إعادة إنشاء المؤقت (setInterval)
  // في كل مرة تتغير فيها الإجابات أو الوقت المتبقي، وهو ما كان يجعل العد
  // التنازلي يتسارع بشكل غير صحيح عند التفاعل السريع مع الأسئلة.
  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;

  useEffect(() => {
    if (stage !== 'exam') return undefined;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitRef.current(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [stage]);

  const selectAnswer = (qid, optionIndex) => {
    setAnswers((prev) => {
      const next = { ...prev, [qid]: optionIndex };
      persist({ userId: user.uid, exam, answers: next, flagged: [...flagged], startTime });
      return next;
    });
  };

  const toggleFlag = (qid) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      persist({ userId: user.uid, exam, answers, flagged: [...next], startTime });
      return next;
    });
  };

  const manualSubmit = () => {
    const unanswered = exam.length - Object.keys(answers).length;
    if (unanswered > 0) {
      const ok = window.confirm(`لديك ${unanswered} سؤالًا بدون إجابة. هل تريد إنهاء الاختبار الآن؟`);
      if (!ok) return;
    }
    handleSubmit(false);
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
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="page tp-exam-page">
      <div className="tp-exam-header">
        <div>السؤال {currentIndex + 1} من {TOTAL_QUESTIONS} — أجبت على {answeredCount}</div>
        <div className={`tp-timer ${secondsLeft <= 300 ? 'tp-timer-danger' : ''}`}>⏱️ {formatTime(secondsLeft)}</div>
      </div>

      <div className="tp-question-grid">
        {exam.map((eq, i) => {
          const state = answers[eq.id] !== undefined ? 'answered' : 'unanswered';
          const isFlagged = flagged.has(eq.id);
          return (
            <button
              key={eq.id}
              className={`tp-grid-cell ${state} ${isFlagged ? 'flagged' : ''} ${i === currentIndex ? 'current' : ''}`}
              onClick={() => setCurrentIndex(i)}
              title={`السؤال ${i + 1}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {q && (
        <fieldset className="quiz-question tp-question-box">
          <div className="tp-question-toolbar">
            <legend>{q.text}</legend>
            <button type="button" className={`tp-flag-btn ${flagged.has(q.id) ? 'active' : ''}`} onClick={() => toggleFlag(q.id)}>
              {flagged.has(q.id) ? '🚩 ملاحظة' : '🏳️ ضع علامة'}
            </button>
          </div>
          {q.options.map((opt, i) => (
            <label key={i} className="quiz-option">
              <input
                type="radio"
                name={q.id}
                checked={answers[q.id] === i}
                onChange={() => selectAnswer(q.id, i)}
              />
              {opt}
            </label>
          ))}
        </fieldset>
      )}

      <div className="tp-exam-nav">
        <button className="btn-secondary" disabled={currentIndex === 0} onClick={() => setCurrentIndex((i) => i - 1)}>
          السؤال السابق
        </button>
        {currentIndex < exam.length - 1 ? (
          <button className="btn-primary" onClick={() => setCurrentIndex((i) => i + 1)}>
            السؤال التالي
          </button>
        ) : (
          <button className="btn-primary" onClick={manualSubmit}>
            إنهاء الاختبار
          </button>
        )}
      </div>

      <button className="link-btn tp-force-submit" onClick={manualSubmit}>
        إنهاء الاختبار الآن
      </button>
    </div>
  );
}
