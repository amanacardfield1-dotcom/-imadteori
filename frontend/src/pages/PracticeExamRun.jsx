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
  const [currentIndex, setCurrentIndex] = useState(0);
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
    if (answers[qid] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [qid]: optionIndex }));
  };

  const goTo = (index) => {
    if (!exam) return;
    setCurrentIndex(Math.min(Math.max(index, 0), exam.questions.length - 1));
  };

  const handleSubmit = async () => {
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

  const currentQuestion = exam.questions[currentIndex];
  const selectedIndex = answers[currentQuestion.id];
  const isAnswered = selectedIndex !== undefined;
  const isCorrect = isAnswered && selectedIndex === currentQuestion.correctIndex;

  return (
    <div className="page tp-sequential-exam">
      <div className="tp-exam-header">
        <div className="tp-current-question">السؤال <strong>{currentIndex + 1}</strong> من {exam.questions.length}</div>
      </div>

      <section
        className={`tp-live-question ${isAnswered ? (isCorrect ? 'is-correct' : 'is-incorrect') : ''}`}
        aria-labelledby="practice-question-title"
      >
        <div className="tp-live-question-heading">
          <h1 id="practice-question-title">{currentQuestion.text}</h1>
        </div>
        {currentQuestion.imageUrl && (
          <img
            src={currentQuestion.imageUrl}
            alt={currentQuestion.imageAlt}
            className="tp-question-image tp-live-question-image"
          />
        )}
        <fieldset className="tp-live-options" disabled={isAnswered} aria-labelledby="practice-question-title">
          {currentQuestion.options.map((opt, i) => {
            const correctOption = isAnswered && i === currentQuestion.correctIndex;
            const incorrectOption = isAnswered && i === selectedIndex && !isCorrect;
            return (
              <label
                key={i}
                className={`tp-answer-option ${correctOption ? 'is-correct' : ''} ${incorrectOption ? 'is-incorrect' : ''}`}
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  checked={selectedIndex === i}
                  onChange={() => selectAnswer(currentQuestion.id, i)}
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

      <div className="tp-exam-nav">
        <button type="button" className="btn-secondary" onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0}>
          السابق
        </button>
        {currentIndex < exam.questions.length - 1 ? (
          <button type="button" className="btn-primary" disabled={!isAnswered} onClick={() => goTo(currentIndex + 1)}>
            السؤال التالي
          </button>
        ) : (
          <button type="button" className="btn-primary" disabled={!isAnswered || submitting} onClick={handleSubmit}>
            {submitting ? 'جارِ الإرسال...' : 'إنهاء وعرض النتيجة'}
          </button>
        )}
      </div>
    </div>
  );
}
