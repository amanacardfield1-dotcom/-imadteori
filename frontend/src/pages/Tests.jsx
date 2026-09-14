import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../firestoreApi';

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getTests()
      .then(setTests)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h1>الاختبارات التدريبية</h1>
      <p>اختر اختبارًا وابدأ المراجعة. النتيجة تظهر فورًا مع شرح لكل سؤال.</p>

      {loading && <p>جارِ التحميل...</p>}
      {error && <p className="error">{error}</p>}

      <div className="tests-grid">
        {tests.map((t) => (
          <div key={t.id} className="test-card">
            <h3>{t.title}</h3>
            <p>{t.description}</p>
            <p className="muted">{t.questionCount} أسئلة</p>
            <Link to={`/tests/${t.id}`} className="btn-primary">
              ابدأ الاختبار
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
