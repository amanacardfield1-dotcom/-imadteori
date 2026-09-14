import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyAttempts } from '../teoriprov/api';
import { TOTAL_QUESTIONS, TOTAL_SCORED, TRIAL_COUNT, PASS_SCORE, EXAM_SECONDS } from '../teoriprov/engine';

export default function TeoriProvIntro() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyAttempts(user.uid)
      .then(setAttempts)
      .finally(() => setLoading(false));
  }, [user.uid]);

  return (
    <div className="page">
      <h1>محاكاة اختبار Teoriprov — رخصة B</h1>
      <p className="muted">
        هذا الاختبار التدريبي مصمَّم ليحاكي بنية اختبار القيادة النظري السويدي الحقيقي لفئة B
        (Behörighet B) من حيث عدد الأسئلة، الوقت، وطريقة احتساب النتيجة، بناءً على المعلومات
        الرسمية المنشورة من Trafikverket و Transportstyrelsen.
      </p>

      <div className="tp-info-grid">
        <div className="tp-info-card"><strong>{TOTAL_QUESTIONS}</strong><span>سؤالًا إجماليًا</span></div>
        <div className="tp-info-card"><strong>{Math.floor(EXAM_SECONDS / 60)}</strong><span>دقيقة</span></div>
        <div className="tp-info-card"><strong>{TOTAL_SCORED}</strong><span>سؤالًا محتسبًا</span></div>
        <div className="tp-info-card"><strong>{TRIAL_COUNT}</strong><span>أسئلة تجريبية غير محتسبة</span></div>
        <div className="tp-info-card"><strong>{PASS_SCORE}/{TOTAL_SCORED}</strong><span>درجة النجاح</span></div>
      </div>

      <ul className="tp-rules-list">
        <li>الأسئلة والخيارات تُولَّد وتُرتَّب عشوائيًا في كل محاولة — لن تحصل على نفس الترتيب مرتين.</li>
        <li>الأسئلة الخمسة التجريبية غير محتسبة ولا يمكنك معرفة أيها هي أثناء الاختبار — تمامًا كالاختبار الحقيقي.</li>
        <li>لكل سؤال إجابة صحيحة واحدة فقط.</li>
        <li>يمكنك وضع علامة على أي سؤال للعودة إليه لاحقًا قبل الإنهاء.</li>
        <li>عند انتهاء الوقت، يُنهى الاختبار تلقائيًا وتُحتسب الأسئلة غير المجاب عنها كإجابات خاطئة.</li>
      </ul>

      <div className="tp-disclaimer">
        ⚠️ هذا اختبار تدريبي مستقل من إعداد أكاديمية عماد، وليس اختبارًا رسميًا تابعًا لـ
        Trafikverket. الأسئلة أصلية من تأليفنا وليست نسخًا من أسئلة الاختبار الرسمي السرّية.
      </div>

      <button className="btn-primary tp-start-btn" onClick={() => navigate('/teoriprov/run')}>
        ابدأ الاختبار
      </button>

      {!loading && attempts.length > 0 && (
        <div className="tp-history">
          <h2>محاولاتك السابقة</h2>
          <div className="table-scroll">
            <table className="results-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>النتيجة</th>
                  <th>الحالة</th>
                  <th>الوقت المستخدم</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a, i) => (
                  <tr key={a.id}>
                    <td>{attempts.length - i}</td>
                    <td>{a.score} / {a.totalScored}</td>
                    <td>
                      <span className={a.passed ? 'success' : 'warning'}>{a.passed ? 'ناجح' : 'غير ناجح'}</span>
                    </td>
                    <td>{Math.floor(a.durationUsedSeconds / 60)}:{String(a.durationUsedSeconds % 60).padStart(2, '0')}</td>
                    <td>{new Date(a.takenAt).toLocaleString('ar-EG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
