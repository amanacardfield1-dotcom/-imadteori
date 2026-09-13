import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        🇸🇪 أكاديمية عماد للتيوري
      </Link>
      <nav className="nav-links">
        <Link to="/tests">الاختبارات</Link>
        <Link to="/traffic-signs">إشارات المرور</Link>
        <Link to="/about">عن المدرب</Link>
        {isAuthenticated ? (
          <>
            {isAdmin ? (
              <Link to="/admin">لوحة الإدارة</Link>
            ) : (
              <Link to="/dashboard">تقدّمي</Link>
            )}
            <span className="nav-user">أهلاً {user?.name}</span>
            <button className="link-btn" onClick={handleLogout}>
              خروج
            </button>
          </>
        ) : (
          <>
            <Link to="/login">دخول</Link>
            <Link to="/register" className="cta-link">
              إنشاء حساب
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
