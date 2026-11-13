import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../firestoreApi';
import { useAuth } from '../context/AuthContext';

export default function Quiz() {
  const { id } = useParams();
  const { user } = useAuth();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTest(null);
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);
    api.getTest(id).then(setTest).catch((e) => setError(e.message));
  }, [id]);

  const selectAnswer = (questionId, optionIndex) => {
    if (answers[questionId] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const goTo = (index) => {
    if (!test) return;
    setCurrentIndex(Math.min(Math.max(index, 0), test.questions.length - 1));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const data = await api.submitTest(user.uid, test, answers);
      setResult(data);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (error && !test) return <div className="page error">{error}</div>;
  if (!test) return <div className="page">جارِ التحميل...</div>;

  if (result) {
    const passed = result.score >= Math.ceil(result.total * 0.7);
    return (
      <div className="page">
        <h1>نتيجتك: {result.score} / {result.total}</h1>
        <p className={passed ? 'success' : 'warning'}>
          {passed ? 'أحسنت! نتيجة جيدة تؤهلك للاختبار الحقيقي بثقة أكبر.' : 'استمر بالمراجعة، راجع الشرح أدناه لكل سؤال أخطأت فيه.'}
        </p>

        <div className="review-list">
          {result.questions.map((q, idx) => (
            <div key={q.id} className={`review-item ${q.isCorrect ? 'correct' : 'incorrect'}`}>
              <p className="review-question">{idx + 1}. {q.text}</p>
              <p>إجابتك: {q.selectedIndex !== null ? q.options[q.selectedIndex] : 'لم تُجب'}</p>
              {!q.isCorrect && <p>الإجابة الصحيحة: {q.options[q.correctIndex]}</p>}
              <p className="explanation">💡 {q.explanation}</p>
            </div>
          ))}
        </div>

        <Link to="/tests" className="btn-primary">العودة لقائمة الاختبارات</Link>
      </div>
    );
  }

  const currentQuestion = test.questions[currentIndex];
  const selectedIndex = answers[currentQuestion.id];
  const isAnswered = selectedIndex !== undefined;
  const isCorrect = isAnswered && selectedIndex === currentQuestion.correctIndex;

  return (
    <div className="page tp-sequential-exam">
      <h1>{test.title}</h1>
      <p className="muted">{test.description}</p>

      <div className="tp-exam-header">
        <div className="tp-current-question">السؤال <strong>{currentIndex + 1}</strong> من {test.questions.length}</div>
      </div>

      <section
        className={`tp-live-question ${isAnswered ? (isCorrect ? 'is-correct' : 'is-incorrect') : ''}`}
        aria-labelledby="quiz-question-title"
      >
        <div className="tp-live-question-heading">
          <h2 id="quiz-question-title">{currentQuestion.text}</h2>
        </div>
        <fieldset className="tp-live-options" disabled={isAnswered} aria-labelledby="quiz-question-title">
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

      {error && <p className="error">{error}</p>}

      <div className="tp-exam-nav">
        <button type="button" className="btn-secondary" onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0}>
          السابق
        </button>
        {currentIndex < test.questions.length - 1 ? (
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
