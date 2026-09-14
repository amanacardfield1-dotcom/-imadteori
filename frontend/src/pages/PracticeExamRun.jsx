import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchPracticeBank, getLastAttemptQuestionIds, saveAttempt } from '../practiceExam/api';
import { generatePracticeExam, gradePracticeExam } from '../practiceExam/engine';

export default function PracticeExamRun() {
  const { user } = useAuth();
  const [stage, setStage] = useState('loading'); // loading | exam | result
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const [bank, recentIds] = await Promise.all([fetchPracticeBank(), getLastAttemptQuestionIds(user.uid)]);
        if (cancelled) return;
        const generated = generatePracticeExam(bank, recentIds);
        if (!generated.questions.length) {
          setError('بنك الأسئلة فارغ حاليًا. تواصل مع الإدارة.');
          return;
        }
        setExam(generated);
        setStage('exam');
      } catch {
        setError('تعذّر تحميل بنك الأسئلة. حاول مرة أخرى.');
      }
    }
    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectAnswer = (qid, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [qid]: optionIndex }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const unanswered = exam.questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      const ok = window.confirm(`لديك ${unanswered} سؤالًا بدون إجابة. هل تريد إنهاء الاختبار الآن؟`);
      if (!ok) return;
    }
    setSubmitting(true);
    const graded = gradePracticeExam(exam.questions, answers);
    setResult(graded);
    setStage('result');
    try {
      const durationUsedSeconds = Math.round((Date.now() - startTime) / 1000);
      await saveAttempt(user, graded, durationUsedSeconds);
    } catch {
      /* فشل حفظ النتيجة بالخادم لا يجب أن يمنع المستخدم من رؤية نتيجته محليًا */
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <div className="page error">{error}</div>;
  if (stage === 'loading') return <div className="page">جارِ تجهيز اختبار جديد...</div>;

  if (stage === 'result' && result) {
    const weakGroups = Object.entries(result.categoryScores)
      .map(([groupId, s]) => {
        const g = exam.questions.find((q) => q.groupId === groupId);
        return { groupId, name: g?.groupName || groupId, pct: s.total ? Math.round((s.correct / s.total) * 100) : 0 };
      })
      .filter((c) => c.pct < 70)
      .sort((a, b) => a.pct - b.pct);

    return (
      <div className="page">
        <h1>نتيجة الاختبار التدريبي</h1>
        <div className={`tp-result-banner ${result.passed ? 'success' : 'warning'}`}>
          <div className="tp-result-score">{result.score} / {result.total}</div>
          <div>{result.passed ? '✅ نتيجة جيدة' : '⚠️ تحتاج مزيدًا من المراجعة'} — ({result.percentage}%)</div>
        </div>

        {weakGroups.length > 0 && (
          <p className="tp-recommendation">
            💡 تحتاج إلى مراجعة موضوعات: <strong>{weakGroups.map((c) => c.name).join('، ')}</strong> قبل إعادة الاختبار.
          </p>
        )}

        <div className="review-list">
          {result.questions.map((q, idx) => (
            <div key={q.id} className={`review-item ${q.isCorrect ? 'correct' : 'incorrect'}`}>
              <p className="review-question">{idx + 1}. {q.text}</p>
              <p className="muted">المجموعة: {q.groupName}</p>
              {q.imageUrl && <img src={q.imageUrl} alt={q.imageAlt} className="tp-question-image" />}
              <p>إجابتك: {q.selectedIndex !== null ? q.options[q.selectedIndex] : 'لم تُجب'}</p>
              {!q.isCorrect && <p>الإجابة الصحيحة: {q.options[q.correctIndex]}</p>}
              <p className="explanation">💡 {q.explanation}</p>
            </div>
          ))}
        </div>

        <Link to="/tests" className="btn-primary">العودة لصفحة الاختبارات</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>اختبار تدريبي</h1>
      <p className="muted">أجبت على {Object.keys(answers).length} من {exam.questions.length} سؤالًا.</p>

      <form onSubmit={handleSubmit} className="quiz-form">
        {exam.questions.map((q, idx) => (
          <fieldset key={q.id} className="quiz-question">
            <legend>{idx + 1}. {q.text}</legend>
            {q.imageUrl && <img src={q.imageUrl} alt={q.imageAlt} className="tp-question-image" />}
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
        ))}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'جارِ الإرسال...' : 'إنهاء وعرض النتيجة'}
        </button>
      </form>
    </div>
  );
}
