import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllAttempts } from '../teoriprov/api';

export default function AdminExamResults() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    getAllAttempts()
      .then(setAttempts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...attempts];
    const s = search.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (a) =>
          (a.userName || '').toLowerCase().includes(s) ||
          (a.userEmail || '').toLowerCase().includes(s) ||
          (a.userId || '').toLowerCase().includes(s)
      );
    }
    if (statusFilter === 'passed') list = list.filter((a) => a.passed);
    if (statusFilter === 'failed') list = list.filter((a) => !a.passed);

    switch (sortBy) {
      case 'date-asc':
        list.sort((a, b) => new Date(a.takenAt) - new Date(b.takenAt));
        break;
      case 'score-desc':
        list.sort((a, b) => b.score - a.score);
        break;
      case 'score-asc':
        list.sort((a, b) => a.score - b.score);
        break;
      case 'name':
        list.sort((a, b) => (a.userName || '').localeCompare(b.userName || '', 'ar'));
        break;
      default:
        list.sort((a, b) => new Date(b.takenAt) - new Date(a.takenAt));
    }
    return list;
  }, [attempts, search, statusFilter, sortBy]);

  return (
    <div className="page">
      <div className="admin-subnav">
        <Link to="/admin">طلبات التسجيل</Link>
        <Link to="/admin/exam-results" className="active">نتائج الاختبارات</Link>
      </div>

      <h1>نتائج اختبارات Teoriprov</h1>
      <p className="muted">جميع محاولات المتدربين على محاكاة الاختبار، مرتبة حسب الأحدث.</p>

      <div className="admin-filters">
        <input
          type="text"
          placeholder="ابحث بالاسم أو البريد أو المعرّف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">كل الحالات</option>
          <option value="passed">ناجح فقط</option>
          <option value="failed">غير ناجح فقط</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date-desc">الأحدث أولًا</option>
          <option value="date-asc">الأقدم أولًا</option>
          <option value="score-desc">العلامة: الأعلى أولًا</option>
          <option value="score-asc">العلامة: الأدنى أولًا</option>
          <option value="name">اسم المتدرب</option>
        </select>
      </div>

      {loading && <p>جارِ التحميل...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && filtered.length === 0 && <p className="muted">لا توجد نتائج مطابقة.</p>}

      {!loading && filtered.length > 0 && (
        <div className="table-scroll">
          <table className="results-table">
            <thead>
              <tr>
                <th>المتدرب</th>
                <th>المعرّف</th>
                <th>التاريخ</th>
                <th>المدة</th>
                <th>صحيحة</th>
                <th>خاطئة</th>
                <th>بدون إجابة</th>
                <th>العلامة</th>
                <th>الحالة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>{a.userName || '—'}<br /><span className="muted">{a.userEmail}</span></td>
                  <td className="tp-mono">{a.userId}</td>
                  <td>{new Date(a.takenAt).toLocaleString('ar-EG')}</td>
                  <td>{Math.floor(a.durationUsedSeconds / 60)}:{String(a.durationUsedSeconds % 60).padStart(2, '0')}</td>
                  <td>{a.score}</td>
                  <td>{a.incorrectCount ?? '—'}</td>
                  <td>{a.unansweredCount ?? '—'}</td>
                  <td>{a.score} / {a.totalScored}</td>
                  <td>
                    <span className={a.passed ? 'success' : 'warning'}>{a.passed ? 'ناجح' : 'غير ناجح'}</span>
                  </td>
                  <td>
                    <Link to={`/admin/exam-results/${a.id}`} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                      التفاصيل
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
