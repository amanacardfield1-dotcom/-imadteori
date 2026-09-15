import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TrafficSignIcon from '../../components/TrafficSignIcon';
import { CATEGORY_CHIPS, getGroupForCode, matchesQuery, trafficSigns } from './data';

function AllSignCard({ sign }) {
  const navigate = useNavigate();
  const group = getGroupForCode(sign.code);
  return (
    <button
      className="sign-card"
      onClick={() => group && navigate(`/traffic-signs/${group.id}/${sign.code}`)}
    >
      <span className="sign-card-visual">
        <TrafficSignIcon shape={sign.shape} glyph={sign.glyph} size={64} />
      </span>
      <span className="sign-card-code">{sign.code}</span>
      <span className="sign-card-ar">{sign.arabicName}</span>
      <span className="sign-card-category-badge">{CATEGORY_CHIPS[sign.category] || sign.category}</span>
    </button>
  );
}

export default function TrafficSignsAll() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const filtered = useMemo(() => trafficSigns.filter((s) => matchesQuery(s, query)), [query]);

  function onChange(value) {
    setQuery(value);
    setSearchParams(value ? { q: value } : {});
  }

  return (
    <div>
      <section className="signs-current-section">
        <div className="signs-section-heading">
          <div>
            <h2>كل الشاخصات المرورية</h2>
            <p>عرض مسطّح لكل الشاخصات مع تمييز الفئة، دون الحاجة للعودة إلى الرئيسية أو التنقل بين الفئات.</p>
          </div>
          <span className="signs-section-count">{filtered.length} / {trafficSigns.length}</span>
        </div>
      </section>

      <div className="signs-toolbar">
        <input
          type="search"
          className="signs-search"
          placeholder="ابحث بالرمز، الاسم العربي، الاسم السويدي، أو كلمة من المعنى..."
          value={query}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
      </div>

      <div className="signs-grid signs-grid-all">
        {filtered.map((s) => <AllSignCard key={s.code} sign={s} />)}
        {filtered.length === 0 && <p className="muted">لا توجد نتائج مطابقة للبحث.</p>}
      </div>
    </div>
  );
}
