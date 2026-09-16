import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchPracticeBank, getMyAttempts } from '../practiceExam/api';
import { getImageQuestionBankStats, IMAGE_EXAM_QUESTION_COUNT } from '../imagePracticeExam/bank';

export default function Tests() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [groupCount, setGroupCount] = useState(null);
  const [questionCount, setQuestionCount] = useState(null);
  const imageBankStats = getImageQuestionBankStats();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyAttempts(user.uid), fetchPracticeBank()])
      .then(([myAttempts, bank]) => {
        setAttempts(myAttempts);
        setGroupCount(bank.groups.filter((g) => g.active !== false).length);
        setQuestionCount(Object.values(bank.byGroup).flat().length);
      })
      .finally(() => setLoading(false));
  }, [user.uid]);

  return (
    <div className="page">
      <h1>الاختبارات التدريبية</h1>
      <p className="muted">
        كل اختبار يُبنى ديناميكيًا من بنك أسئلة أصلي منظَّم على {groupCount ?? '26'} مجموعة معرفية
        تغطي نطاق اختبار Teoriprov لرخصة B — بأوزان مختلفة حسب أهمية كل موضوع، وأسئلة وخيارات
        تُختار وتُرتَّب عشوائيًا في كل محاولة. لن تحصل على نفس مجموعة الأسئلة أو نفس الترتيب مرتين.
      </p>

      {!loading && (
        <div className="tp-info-grid">
          <div className="tp-info-card"><strong>{questionCount ?? '-'}</strong><span>سؤالًا في البنك</span></div>
          <div className="tp-info-card"><strong>{groupCount ?? '-'}</strong><span>مجموعة معرفية</span></div>
          <div className="tp-info-card"><strong>40</strong><span>سؤالًا لكل اختبار</span></div>
        </div>
      )}

      <div className="tests-actions">
        <Link to="/tests/run" className="btn-primary tp-start-btn">ابدأ اختبارًا تدريبيًا جديدًا</Link>
        <Link to="/tests/images" className="btn-secondary tp-start-btn">ابدأ اختبارًا تفاعليًا بالصور</Link>
      </div>

      <div className="image-bank-strip">
        <strong>{imageBankStats.total}</strong>
        <span>سؤالًا مصورًا في بنك الشاخصات، يظهر منها {IMAGE_EXAM_QUESTION_COUNT} سؤالًا في كل محاولة.</span>
      </div>

      {!loading && attempts.length > 0 && (
        <div className="tp-history">
          <h2>محاولاتك السابقة</h2>
          <div className="table-scroll">
            <table className="results-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>النتيجة</th>
                  <th>النسبة</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a, i) => (
                  <tr key={a.id}>
                    <td>{attempts.length - i}</td>
                    <td>{a.score} / {a.total}</td>
                    <td>
                      <span className={a.passed ? 'success' : 'warning'}>{a.percentage}%</span>
                    </td>
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
