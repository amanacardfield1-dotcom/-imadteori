import { Link, Outlet, useParams } from 'react-router-dom';
import { SIGN_GROUPS } from './data';

export default function TrafficSignsLayout() {
  const { groupId } = useParams();

  return (
    <div className="page page-wide traffic-signs-page">
      <nav className="signs-nav" aria-label="تصنيفات الشاخصات المرورية">
        <Link
          to="/traffic-signs"
          className={`signs-nav-item signs-nav-home ${!groupId ? 'active' : ''}`}
        >
          الرئيسية
        </Link>
        {SIGN_GROUPS.map((group) => (
          <Link
            key={group.id}
            to={`/traffic-signs/${group.id}`}
            className={`signs-nav-item ${groupId === group.id ? 'active' : ''}`}
          >
            <span className="signs-nav-code">{group.code}</span>
            {group.label}
          </Link>
        ))}
        <Link
          to="/traffic-signs/all"
          className={`signs-nav-item signs-nav-all ${groupId === 'all' ? 'active' : ''}`}
        >
          كل الشاخصات
        </Link>
      </nav>
      <Outlet />
    </div>
  );
}
