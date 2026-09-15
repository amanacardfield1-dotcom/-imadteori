import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TrafficSignVisual from '../../components/TrafficSignVisual';
import { SIGN_GROUPS, IMPORTANT_CODES, getGroupSigns } from './data';

export default function TrafficSignsLanding() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const groupStats = useMemo(() => SIGN_GROUPS.map((group) => {
    const signs = getGroupSigns(group);
    const featured = signs.filter((sign) => IMPORTANT_CODES.has(sign.code));
    return {
      ...group,
      count: signs.length,
      examples: (featured.length ? featured : signs).slice(0, 4),
    };
  }), []);

  const totalCount = groupStats.reduce((sum, g) => sum + g.count, 0);

  function onSearchSubmit(e) {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/traffic-signs/all?q=${encodeURIComponent(q)}` : '/traffic-signs/all');
  }

  return (
    <div>
      <div className="signs-hero">
        <div>
          <h1>جميع الشاخصات المرورية في السويد</h1>
        </div>
        <div className="signs-hero-count"><strong>{totalCount}</strong><span>شاخصة</span></div>
      </div>

      <form className="signs-toolbar" onSubmit={onSearchSubmit}>
        <input
          type="search"
          className="signs-search"
          placeholder="ابحث في كل الشاخصات بالرمز، الاسم العربي، الاسم السويدي، أو كلمة من المعنى..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      <div className="sign-group-grid" aria-label="فئات الشاخصات المرورية">
        {groupStats.map((group) => (
          <a
            key={group.id}
            href={`/traffic-signs/${group.id}`}
            className="sign-group-card"
            onClick={(e) => { e.preventDefault(); navigate(`/traffic-signs/${group.id}`); }}
          >
            <span className="sign-group-code">{group.code}</span>
            <span className="sign-group-title">{group.label}</span>
            <span className="sign-group-examples">
              {group.examples.map((sign) => (
                <TrafficSignVisual key={sign.code} sign={sign} size={34} />
              ))}
            </span>
            <span className="sign-group-meta">{group.count} علامة</span>
          </a>
        ))}
      </div>
    </div>
  );
}
