import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TrafficSignIcon from '../../components/TrafficSignIcon';
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
          <p className="signs-eyebrow">مرجع الشاخصات المرورية في السويد</p>
          <h1>جميع الشاخصات المرورية في السويد</h1>
          <p>
            {totalCount} شاخصة موزّعة على {groupStats.length} فئة، منظمة بنفس فروع التصنيف الرسمي
            (Transportstyrelsen / Vägmärkesförordning): التحذير، الأولوية، المنع، الإلزام، الإرشاد،
            التوجيه، العلامات الأرضية، الإشارات الضوئية، وغيرها.
          </p>
        </div>
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
            <span className="sign-group-source">
              {group.sourceLabel}
              {!group.inReference && ' · توسّع تعليمي إضافي'}
            </span>
            <span className="sign-group-examples">
              {group.examples.map((sign) => (
                <TrafficSignIcon key={sign.code} shape={sign.shape} glyph={sign.glyph} size={34} />
              ))}
            </span>
            <span className="sign-group-meta">{group.count} علامة</span>
          </a>
        ))}
      </div>
    </div>
  );
}
