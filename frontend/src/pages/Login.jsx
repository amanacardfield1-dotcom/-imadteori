import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.login({ email, password });
      login(data);
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.status === 'approved') navigate('/dashboard');
      else navigate('/pending');
    } catch (e2) {
      setError(e2.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <h1>تسجيل الدخول</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          البريد الإلكتروني
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          كلمة المرور
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'جارِ الدخول...' : 'دخول'}
        </button>
      </form>
      <p>
        ليس لديك حساب؟ <Link to="/register">أنشئ حسابًا مجانًا</Link>
      </p>
    </div>
  );
}
