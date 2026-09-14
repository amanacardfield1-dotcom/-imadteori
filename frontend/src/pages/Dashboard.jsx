import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../firestoreApi';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getMyResults(user.uid)
      .then(setResults)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user.uid]);

  const average = results.length
    ? Math.round((results.reduce((sum, r) => sum + r.score / r.total, 0) / results.length) * 100)
    : null;

  return (
    <div className="page">
      <h1>تقدّم {user?.name}</h1>

      {loading && <p>جارِ التحميل...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && results.length === 0 && (
        <p>
          لم تخض أي اختبار بعد. <Link to="/tests">ابدأ أول اختبار الآن</Link>.
        </p>
      )}

      {results.length > 0 && (
        <>
          <p className="muted">متوسط نتائجك: {average}%</p>
          <div className="table-scroll">
            <table className="results-table">
              <thead>
                <tr>
                  <th>الاختبار</th>
                  <th>النتيجة</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id}>
                    <td>{r.testTitle}</td>
                    <td>{r.score} / {r.total}</td>
                    <td>{new Date(r.takenAt).toLocaleString('ar-EG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
