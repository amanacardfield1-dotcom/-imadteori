import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import TrafficSignIcon from '../../components/TrafficSignIcon';
import { CATEGORY_CHIPS, getGroup, getGroupSigns, matchesQuery } from './data';

function SignCard({ sign, groupId }) {
  const navigate = useNavigate();
  return (
    <button className="sign-card" onClick={() => navigate(`/traffic-signs/${groupId}/${sign.code}`)}>
      <span className="sign-card-visual">
        <TrafficSignIcon shape={sign.shape} glyph={sign.glyph} size={64} />
      </span>
      <span className="sign-card-code">{sign.code}</span>
      <span className="sign-card-ar">{sign.arabicName}</span>
    </button>
  );
}

export default function TrafficSignsCategoryGrid() {
  const { groupId } = useParams();
  const group = getGroup(groupId);
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  const allSigns = useMemo(() => (group ? getGroupSigns(group) : []), [group]);

  const filtered = useMemo(() => allSigns.filter((s) => {
    if (category !== 'all' && s.category !== category) return false;
    return matchesQuery(s, query);
  }), [allSigns, category, query]);

  const groupedByCategory = useMemo(() => {
    if (!group) return [];
    return group.categories
      .map((cat) => ({
        category: cat,
        label: CATEGORY_CHIPS[cat] || cat,
        signs: filtered.filter((sign) => sign.category === cat),
      }))
      .filter((item) => item.signs.length > 0);
  }, [group, filtered]);

  if (!group) return <Navigate to="/traffic-signs" replace />;

  return (
    <div>
      <section className="signs-current-section">
        <div className="signs-section-heading">
          <div>
            <span className="signs-section-code">{group.code}</span>
            <h2>{group.label}</h2>
          </div>
          <span className="signs-section-count">{filtered.length} نتيجة</span>
        </div>
      </section>

      <div className="signs-toolbar">
        <input
          type="search"
          className="signs-search"
          placeholder="ابحث بالرمز، الاسم العربي، الاسم السويدي، أو كلمة من المعنى..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {group.categories.length > 1 && (
          <div className="signs-category-chips">
            <button className={`chip ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>الكل</button>
            {group.categories.map((c) => (
              <button key={c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
                {CATEGORY_CHIPS[c] || c}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="signs-results">
        {groupedByCategory.map((g) => (
          <section key={g.category} className="signs-result-group">
            {group.categories.length > 1 && (
              <div className="signs-result-title">
                <h3>{g.label}</h3>
                <span>{g.signs.length} علامة</span>
              </div>
            )}
            <div className="signs-grid">
              {g.signs.map((s) => (
                <SignCard key={s.code} sign={s} groupId={groupId} />
              ))}
            </div>
          </section>
        ))}
        {filtered.length === 0 && <p className="muted">لا توجد نتائج مطابقة للبحث.</p>}
      </div>

      <Link to="/traffic-signs" className="signs-back-link">→ العودة إلى كل الفئات</Link>
    </div>
  );
}
