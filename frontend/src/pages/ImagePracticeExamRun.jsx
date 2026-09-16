import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  generateImagePracticeExam,
  getLastImageExamQuestionIds,
  gradeImagePracticeExam,
  saveImageExamAttempt,
} from '../imagePracticeExam/bank';

export default function ImagePracticeExamRun() {
  const { user } = useAuth();
  const [exam] = useState(() => {
    const recentIds = getLastImageExamQuestionIds(user.uid);
    return generateImagePracticeExam(recentIds);
  });
  const [stage, setStage] = useState(() => (exam.questions.length ? 'exam' : 'empty'));
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flagged, setFlagged] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(() => Date.now());

  const answeredCount = Object.keys(answers).length;
  const currentQuestion = exam?.questions[currentIndex];

  const weakGroups = useMemo(() => {
    if (!result) return [];
    return Object.entries(result.categoryScores)
      .map(([groupId, score]) => {
        const question = result.questions.find((q) => q.groupId === groupId);
        const pct = score.total ? Math.round((score.correct / score.total) * 100) : 0;
        return { groupId, name: question?.groupName || groupId, pct };
      })
      .filter((group) => group.pct < 70)
      .sort((a, b) => a.pct - b.pct);
  }, [result]);

  const selectAnswer = (qid, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [qid]: optionIndex }));
  };

  const goTo = (index) => {
    if (!exam) return;
    setCurrentIndex(Math.min(Math.max(index, 0), exam.questions.length - 1));
  };

  const handleSubmit = async () => {
    if (!exam || submitting) return;
    const unanswered = exam.questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      const ok = window.confirm(`لديك ${unanswered} سؤالًا بدون إجابة. هل تريد إنهاء الاختبار الآن؟`);
      if (!ok) return;
    }

    setSubmitting(true);
    const graded = gradeImagePracticeExam(exam.questions, answers);
    setResult(graded);
    setStage('result');
    const durationUsedSeconds = Math.round((Date.now() - startTime) / 1000);
    saveImageExamAttempt(user, graded, durationUsedSeconds);
    setSubmitting(false);
  };

  if (stage === 'empty') return <div className="page error">بنك أسئلة الصور فارغ حاليًا.</div>;

  if (stage === 'result' && result) {
    return (
      <div className="page image-exam-page">
        <h1>نتيجة الاختبار التفاعلي بالصور</h1>
        <div className={`tp-result-banner ${result.passed ? 'success' : 'warning'}`}>
          <div className="tp-result-score">{result.score} / {result.total}</div>
          <div>{result.passed ? 'نتيجة جيدة' : 'تحتاج مزيدًا من المراجعة'} — ({result.percentage}%)</div>
        </div>

        {weakGroups.length > 0 && (
          <p className="tp-recommendation">
            تحتاج إلى مراجعة: <strong>{weakGroups.map((group) => group.name).join('، ')}</strong>
          </p>
        )}

        <div className="review-list">
          {result.questions.map((question, idx) => (
            <div key={question.id} className={`review-item ${question.isCorrect ? 'correct' : 'incorrect'}`}>
              <p className="review-question">{idx + 1}. {question.text}</p>
              <p className="muted">{question.groupName} — {question.signCode}</p>
              <img src={question.imageUrl} alt={question.imageAlt} className="image-exam-review-image" />
              <p>إجابتك: {question.selectedIndex !== null ? question.options[question.selectedIndex] : 'لم تُجب'}</p>
              {!question.isCorrect && <p>الإجابة الصحيحة: {question.options[question.correctIndex]}</p>}
              <p className="explanation">{question.explanation}</p>
            </div>
          ))}
        </div>

        <Link to="/tests" className="btn-primary">العودة لصفحة الاختبارات</Link>
      </div>
    );
  }

  return (
    <div className="page image-exam-page">
      <div className="tp-exam-header">
        <div>
          <h1>اختبار تفاعلي بالصور</h1>
          <p className="muted">أجبت على {answeredCount} من {exam.questions.length} سؤالًا.</p>
        </div>
        <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'جارِ الإنهاء...' : 'إنهاء الاختبار'}
        </button>
      </div>

      <div className="tp-question-grid image-question-grid" aria-label="تنقل بين الأسئلة">
        {exam.questions.map((question, index) => (
          <button
            key={question.id}
            type="button"
            className={[
              'tp-grid-cell',
              answers[question.id] !== undefined ? 'answered' : '',
              flagged[question.id] ? 'flagged' : '',
              currentIndex === index ? 'current' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => goTo(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <fieldset className="quiz-question tp-question-box image-question-box">
        <div className="tp-question-toolbar">
          <legend>{currentIndex + 1}. {currentQuestion.text}</legend>
          <button
            type="button"
            className={`tp-flag-btn ${flagged[currentQuestion.id] ? 'active' : ''}`}
            onClick={() => setFlagged((prev) => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }))}
          >
            مراجعة لاحقًا
          </button>
        </div>

        <p className="muted image-question-meta">{currentQuestion.groupName} — {currentQuestion.signCode}</p>
        <img src={currentQuestion.imageUrl} alt={currentQuestion.imageAlt} className="image-exam-question-image" />

        <div className="image-options">
          {currentQuestion.options.map((option, index) => (
            <label key={option} className="quiz-option image-option">
              <input
                type="radio"
                name={currentQuestion.id}
                checked={answers[currentQuestion.id] === index}
                onChange={() => selectAnswer(currentQuestion.id, index)}
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="tp-exam-nav">
        <button type="button" className="btn-secondary" onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0}>
          السابق
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => goTo(currentIndex + 1)}
          disabled={currentIndex === exam.questions.length - 1}
        >
          التالي
        </button>
      </div>

      <button type="button" className="tp-force-submit" onClick={handleSubmit}>
        إنهاء الاختبار الآن
      </button>
    </div>
  );
}
