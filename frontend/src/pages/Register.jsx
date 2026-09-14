import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../firestoreApi';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.register(name, email, password);
      setDone(true);
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="page auth-page">
        <h1>تم إرسال طلبك ✅</h1>
        <p>
          سيقوم عماد بمراجعة طلب تسجيلك والموافقة عليه شخصيًا. بعد الموافقة يمكنك{' '}
          <Link to="/login">تسجيل الدخول</Link> والبدء في الاختبارات.
        </p>
      </div>
    );
  }

  return (
    <div className="page auth-page">
      <h1>طلب انضمام للمنصة</h1>
      <p className="muted">إنشاء الحساب مجاني، لكنه يحتاج موافقة عماد قبل تفعيل الدخول للمحتوى.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          الاسم
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          البريد الإلكتروني
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          كلمة المرور (6 أحرف على الأقل)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'جارِ الإرسال...' : 'إرسال طلب الانضمام'}
        </button>
      </form>
      <p>
        لديك حساب بالفعل؟ <Link to="/login">سجّل الدخول</Link>
      </p>
    </div>
  );
}
