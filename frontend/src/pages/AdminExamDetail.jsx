import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAttemptById } from '../teoriprov/api';
import { CATEGORY_LABELS } from '../teoriprov/engine';

export default function AdminExamDetail() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    getAttemptById(id)
      .then((a) => {
        if (!a) setError('لم يتم العثور على هذه المحاولة.');
        else setAttempt(a);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const downloadPdf = async () => {
    setGenerating(true);
    try {
      const { generateAttemptPdf } = await import('../teoriprov/pdfReport');
      await generateAttemptPdf(attempt);
    } catch (e) {
      setError('تعذّر إنشاء ملف PDF: ' + e.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="page">جارِ التحميل...</div>;
  if (error) return <div className="page error">{error}</div>;
  if (!attempt) return null;

  return (
    <div className="page">
      <div className="admin-subnav">
        <Link to="/admin">طلبات التسجيل</Link>
        <Link to="/admin/exam-results">نتائج الاختبارات</Link>
        <Link to="/admin/question-bank">بنك الأسئلة الجديد</Link>
      </div>

      <Link to="/admin/exam-results">← العودة لقائمة النتائج</Link>

      <h1 style={{ marginTop: 12 }}>تفاصيل محاولة اختبار</h1>

      <div className="tp-info-grid">
        <div className="tp-info-card"><strong>{attempt.userName || '—'}</strong><span>المتدرب</span></div>
        <div className="tp-info-card"><strong>{attempt.score}/{attempt.totalScored}</strong><span>العلامة</span></div>
        <div className="tp-info-card"><strong>{attempt.percentage}%</strong><span>النسبة</span></div>
        <div className="tp-info-card">
          <strong className={attempt.passed ? 'success' : 'warning'}>{attempt.passed ? 'ناجح' : 'غير ناجح'}</strong>
          <span>الحالة</span>
        </div>
        <div className="tp-info-card">
          <strong>{Math.floor(attempt.durationUsedSeconds / 60)}:{String(attempt.durationUsedSeconds % 60).padStart(2, '0')}</strong>
          <span>الوقت المستخدم</span>
        </div>
      </div>

      <table className="results-table" style={{ marginBottom: 16 }}>
        <tbody>
          <tr><td style={{ fontWeight: 700, padding: '6px 12px' }}>البريد الإلكتروني</td><td style={{ padding: '6px 12px' }}>{attempt.userEmail}</td></tr>
          <tr><td style={{ fontWeight: 700, padding: '6px 12px' }}>User ID</td><td style={{ padding: '6px 12px' }} className="tp-mono">{attempt.userId}</td></tr>
          <tr><td style={{ fontWeight: 700, padding: '6px 12px' }}>بدء الاختبار</td><td style={{ padding: '6px 12px' }}>{new Date(attempt.startedAt).toLocaleString('ar-EG')}</td></tr>
          <tr><td style={{ fontWeight: 700, padding: '6px 12px' }}>انتهاء الاختبار</td><td style={{ padding: '6px 12px' }}>{new Date(attempt.takenAt).toLocaleString('ar-EG')}</td></tr>
          <tr><td style={{ fontWeight: 700, padding: '6px 12px' }}>صحيحة / خاطئة / بدون إجابة</td><td style={{ padding: '6px 12px' }}>{attempt.score} / {attempt.incorrectCount ?? '—'} / {attempt.unansweredCount ?? '—'}</td></tr>
        </tbody>
      </table>

      <button className="btn-primary" onClick={downloadPdf} disabled={generating}>
        {generating ? 'جارِ إنشاء الملف...' : '⬇️ تحميل تقرير PDF'}
      </button>

      <h2 style={{ marginTop: 28 }}>الأداء حسب المجال</h2>
      <div className="table-scroll">
        <table className="results-table">
          <thead><tr><th>المجال</th><th>النتيجة</th><th>النسبة</th></tr></thead>
          <tbody>
            {Object.entries(attempt.categoryScores).map(([cat, s]) => (
              <tr key={cat}>
                <td>{CATEGORY_LABELS[cat]}</td>
                <td>{s.correct} / {s.total}</td>
                <td>{s.total ? Math.round((s.correct / s.total) * 100) : 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ marginTop: 28 }}>الأسئلة كما ظهرت لهذا المتدرب في هذه المحاولة</h2>
      <div className="review-list">
        {attempt.questions.map((q, idx) => (
          <div key={q.id} className={`review-item ${q.isTrial ? '' : q.isCorrect ? 'correct' : 'incorrect'}`}>
            <p className="review-question">
              {idx + 1}. {q.text} {q.isTrial && <span className="tp-trial-tag">سؤال تجريبي غير محتسب</span>}
            </p>
            <p className="muted">المجال: {CATEGORY_LABELS[q.category]}</p>
            {q.imageUrl && <img src={q.imageUrl} alt="" style={{ maxWidth: '100%', borderRadius: 8, margin: '8px 0' }} />}
            <ul style={{ margin: '8px 0' }}>
              {q.options.map((opt, i) => (
                <li
                  key={i}
                  style={{
                    fontWeight: i === q.correctIndex ? 700 : 400,
                    color: i === q.selectedIndex && i !== q.correctIndex ? 'var(--danger)' : i === q.correctIndex ? 'var(--success)' : 'inherit',
                  }}
                >
                  {opt}
                  {i === q.selectedIndex && ' — إجابة المتدرب'}
                  {i === q.correctIndex && ' ✓'}
                </li>
              ))}
            </ul>
            <p>
              {q.isTrial
                ? 'لا تُحتسب'
                : q.selectedIndex === null
                ? '⬤ بدون إجابة'
                : q.isCorrect
                ? '✓ صحيحة'
                : '✗ خاطئة'}
            </p>
            <p className="explanation">💡 {q.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
