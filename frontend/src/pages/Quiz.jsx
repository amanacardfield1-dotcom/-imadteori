import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Quiz() {
  const { id } = useParams();
  const { token } = useAuth();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTest(null);
    setResult(null);
    setAnswers({});
    api.getTest(id, token).then(setTest).catch((e) => setError(e.message));
  }, [id, token]);

  const selectAnswer = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const data = await api.submitTest(id, answers, token);
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

  return (
    <div className="page">
      <h1>{test.title}</h1>
      <p>{test.description}</p>

      <form onSubmit={handleSubmit} className="quiz-form">
        {test.questions.map((q, idx) => (
          <fieldset key={q.id} className="quiz-question">
            <legend>{idx + 1}. {q.text}</legend>
            {q.options.map((opt, i) => (
              <label key={i} className="quiz-option">
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === i}
                  onChange={() => selectAnswer(q.id, i)}
                  required
                />
                {opt}
              </label>
            ))}
          </fieldset>
        ))}

        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'جارِ الإرسال...' : 'إنهاء وعرض النتيجة'}
        </button>
      </form>
    </div>
  );
}
