import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .getAllUsers(token)
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const act = async (id, action) => {
    setBusyId(id);
    try {
      if (action === 'approve') await api.approveUser(id, token);
      else await api.rejectUser(id, token);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const statusLabel = { pending: 'بانتظار الموافقة', approved: 'مفعّل', rejected: 'مرفوض' };

  return (
    <div className="page">
      <h1>لوحة إدارة المتدربين</h1>
      <p className="muted">هنا يوافق عماد على طلبات التسجيل الجديدة أو يرفضها.</p>

      {loading && <p>جارِ التحميل...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && (
        <div className="table-scroll">
          <table className="results-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>البريد الإلكتروني</th>
                <th>الحالة</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter((u) => u.role !== 'admin')
                .map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{statusLabel[u.status] || u.status}</td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="btn-primary"
                          disabled={u.status === 'approved' || busyId === u.id}
                          onClick={() => act(u.id, 'approve')}
                        >
                          موافقة
                        </button>
                        <button
                          className="btn-danger"
                          disabled={u.status === 'rejected' || busyId === u.id}
                          onClick={() => act(u.id, 'reject')}
                        >
                          رفض
                        </button>
                      </div>
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
