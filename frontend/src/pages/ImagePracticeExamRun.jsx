import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchPracticeBank } from '../practiceExam/api';
import { originalImageQuestions } from '../practiceExam/bankAdapters';
import {
  generateImagePracticeExam,
  combinedImageQuestionBank,
  getLastImageExamQuestionIds,
  gradeImagePracticeExam,
  saveImageExamAttempt,
} from '../imagePracticeExam/bank';
import { realPhotoQuestions } from '../imagePracticeExam/realPhotoQuestions';

export default function ImagePracticeExamRun() {
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [stage, setStage] = useState('loading');
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flagged, setFlagged] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetchPracticeBank().then((bank) => {
      const generated = generateImagePracticeExam(
        getLastImageExamQuestionIds(user.uid),
        combinedImageQuestionBank([...originalImageQuestions(bank), ...realPhotoQuestions])
      );
      if (!cancelled) { setExam(generated); setStartTime(Date.now()); setStage('exam'); }
    }).catch(() => { if (!cancelled) setStage('error'); });
    return () => { cancelled = true; };
  }, [user.uid]);

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
    if (answers[qid] !== undefined) return;
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

  if (stage === 'loading') return <div className="page">جارٍ تحميل الأسئلة...</div>;
  if (stage === 'error') return <div className="page error">تعذر تحميل أسئلة الصور. <Link to="/tests">العودة للاختبارات</Link></div>;

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
              <p className="muted">{question.groupName}{question.signCode ? ` — ${question.signCode}` : ''}</p>
              <img src={question.imageUrl} alt={question.imageAlt} className={`image-exam-review-image ${question.edition ? 'original-scene-image' : ''}`} />
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

  const selectedIndex = answers[currentQuestion?.id];
  const isAnswered = selectedIndex !== undefined;
  const isCorrect = isAnswered && selectedIndex === currentQuestion.correctIndex;

  return (
    <div className="page image-exam-page tp-sequential-exam">
      <div className="tp-exam-header">
        <div className="tp-current-question">السؤال <strong>{currentIndex + 1}</strong> من {exam.questions.length}</div>
        <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'جارِ الإنهاء...' : 'إنهاء الاختبار'}
        </button>
      </div>

      <section
        className={`tp-live-question image-question-box ${isAnswered ? (isCorrect ? 'is-correct' : 'is-incorrect') : ''}`}
        aria-labelledby="image-question-title"
      >
        <div className="tp-question-toolbar">
          <div className="tp-live-question-heading">
            <h1 id="image-question-title">{currentQuestion.text}</h1>
          </div>
          <button
            type="button"
            className={`tp-flag-btn ${flagged[currentQuestion.id] ? 'active' : ''}`}
            onClick={() => setFlagged((prev) => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }))}
          >
            مراجعة لاحقًا
          </button>
        </div>

        {currentQuestion.signCode && <p className="muted image-question-meta">رمز الشاخصة: {currentQuestion.signCode}</p>}
        <img
          src={currentQuestion.imageUrl}
          alt={currentQuestion.imageAlt}
          className={`image-exam-question-image tp-live-question-image ${currentQuestion.edition ? 'original-scene-image' : ''}`}
        />

        <fieldset className="tp-live-options" disabled={isAnswered} aria-labelledby="image-question-title">
          {currentQuestion.options.map((option, index) => {
            const correctOption = isAnswered && index === currentQuestion.correctIndex;
            const incorrectOption = isAnswered && index === selectedIndex && !isCorrect;
            return (
              <label
                key={`${currentQuestion.id}-${index}`}
                className={`tp-answer-option ${correctOption ? 'is-correct' : ''} ${incorrectOption ? 'is-incorrect' : ''}`}
              >
                <input
                  type="radio"
                  name={currentQuestion.id}
                  checked={selectedIndex === index}
                  onChange={() => selectAnswer(currentQuestion.id, index)}
                />
                <span className="tp-answer-text">{option}</span>
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
          <button type="button" className="btn-primary" disabled={!isAnswered} onClick={handleSubmit}>
            إنهاء الاختبار
          </button>
        )}
      </div>

      <button type="button" className="link-btn tp-force-submit" onClick={handleSubmit}>
        إنهاء الاختبار الآن
      </button>
    </div>
  );
}
