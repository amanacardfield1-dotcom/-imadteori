import { useMemo, useState } from 'react';
import { trafficSigns } from '../trafficSignsData';
import TrafficSignIcon from '../components/TrafficSignIcon';

const SIGN_GROUPS = [
  { id: 'warning', label: 'شاخصات التحذير', code: 'A', categories: ['A'], sourceLabel: 'Varningsmarken', summary: 'تنبهك إلى خطر أو وضع خاص أمامك، والقاعدة العملية هي تخفيف السرعة وزيادة الانتباه قبل الوصول إليه.' },
  { id: 'priority', label: 'شاخصات الأولوية', code: 'B', categories: ['B'], sourceLabel: 'Vajningspliktsmarken', summary: 'تحدد من له حق المرور: إعطاء الأولوية، قف، الطريق الرئيسي، وتنظيم المرور المتقابل.' },
  { id: 'prohibition', label: 'شاخصات المنع', code: 'C', categories: ['C'], sourceLabel: 'Forbudsmarken', summary: 'تمنع دخولًا أو حركة أو سرعة أو توقفًا أو نوعًا معينًا من المركبات، وغالبًا تتغير تفاصيلها بلوحات إضافية.' },
  { id: 'mandatory', label: 'شاخصات الإلزام', code: 'D', categories: ['D'], sourceLabel: 'Pabudsmarken', summary: 'تجبر السائق أو مستخدم الطريق على اتجاه أو مسار أو استعمال محدد مثل الدوار، المشاة، الدراجات أو الحافلات.' },
  { id: 'guidance', label: 'شاخصات الإرشاد', code: 'E', categories: ['E'], sourceLabel: 'Anvisningsmarken', summary: 'تشرح نوع الطريق أو المنطقة والقواعد العامة فيها، مثل الأوتوستراد، شارع المشاة، موقف السيارات أو منطقة السكن.' },
  { id: 'directions', label: 'شاخصات التوجيه للطرق', code: 'F', categories: ['F'], sourceLabel: 'Lokaliseringsmarken', summary: 'تساعدك على اختيار الاتجاه أو المخرج أو المسار الصحيح قبل التقاطعات والطرق السريعة والمناطق المختلفة.' },
  { id: 'places', label: 'شاخصات المراكز المهمة', code: 'G', categories: ['G'], sourceLabel: 'Platser och inrattningar', summary: 'تدل على مرافق مهمة يحتاجها السائق مثل المستشفى، محطة القطار، المطار، المعدية أو المنطقة الصناعية.' },
  { id: 'services', label: 'الخدمات والسياحة والمعلومات', code: 'H-I-J', categories: ['H', 'I', 'J'], sourceLabel: 'Service, turism och upplysning', summary: 'لوحات عملية للمرافق والخدمات والسياحة والمعلومات العامة أثناء الرحلة.' },
  { id: 'markings', label: 'العلامات الأرضية', code: 'M', categories: ['M'], sourceLabel: 'Vagmarkeringar', summary: 'خطوط ورموز مرسومة على الطريق تحدد المسارات، الحواف، مناطق المنع، الوقوف، ممرات المشاة والدراجات.' },
  { id: 'lights', label: 'الإشارات الضوئية والسكك', code: 'SIG-Y', categories: ['SIG', 'Y'], sourceLabel: 'Trafiksignaler och plankorsning', summary: 'إشارات التقاطعات والعبور وسكك الحديد: الأحمر، الأصفر، الأخضر، الأسهم، الأصوات، الحواجز والضوء الوماض.' },
  { id: 'officers', label: 'إشارات البوليس والحارس', code: 'P-V', categories: ['P', 'V'], sourceLabel: 'Polismans och vakts tecken', summary: 'إشارات اليد أو المركبة التي تصدر من الشرطة أو حارس الطريق، وهي مقدمة على الشاخصات والإشارات العادية عند التعارض.' },
  { id: 'devices', label: 'تجهيزات الإرشاد على الطرق', code: 'X', categories: ['X'], sourceLabel: 'Anordningar', summary: 'حواجز وأسهم ولوحات مؤقتة أو ثابتة تساعد على توجيه الحركة حول العوائق والتحويلات وأعمال الطريق.' },
  { id: 'additional', label: 'لوحات إضافية', code: 'T', categories: ['T'], sourceLabel: 'Tillaggstavlor', summary: 'تضيف تفاصيل للشاخصة الرئيسية مثل المسافة، المدة، الاتجاه، الوقت، الوزن أو الاستثناءات.' },
  { id: 'symbols', label: 'شاخصات الرموز', code: 'S', categories: ['S'], sourceLabel: 'Symboler', summary: 'رموز مختصرة لأنواع المركبات ومستخدمي الطريق، وتظهر عادة داخل شاخصات أو لوحات إضافية.' },
];

const CATEGORY_CHIPS = {
  A: 'A - تحذير', B: 'B - أولوية', C: 'C - منع', D: 'D - إلزام', E: 'E - إرشاد',
  F: 'F - اتجاهات', G: 'G - مرافق عامة', H: 'H - خدمات', I: 'I - سياحة', J: 'J - معلومات',
  T: 'T - لوحات إضافية', M: 'M - خطوط الطريق', SIG: 'إشارات ضوئية',
  P: 'P - إشارات الشرطة', V: 'V - إشارات المراقب', X: 'X - أجهزة تنظيم', Y: 'Y - سكك حديد', S: 'S - رموز',
};

const IMPORTANT_CODES = new Set(['B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C31', 'C35', 'C36', 'D1', 'D3', 'E1', 'E19', 'SIG1', 'SIG3', 'Y1']);

function SignCard({ sign, onOpen }) {
  return (
    <button className="sign-card" onClick={() => onOpen(sign)}>
      <span className="sign-card-visual">
        <TrafficSignIcon shape={sign.shape} glyph={sign.glyph} size={64} />
      </span>
      <span className="sign-card-code">{sign.code}</span>
      <span className="sign-card-ar">{sign.arabicName}</span>
      <span className="sign-card-sv">{sign.swedishName}</span>
    </button>
  );
}

function GroupCard({ group, count, examples, isActive, onSelect }) {
  return (
    <button className={`sign-group-card ${isActive ? 'active' : ''}`} onClick={onSelect}>
      <span className="sign-group-code">{group.code}</span>
      <span className="sign-group-title">{group.label}</span>
      <span className="sign-group-source">{group.sourceLabel}</span>
      <span className="sign-group-examples">
        {examples.map((sign) => (
          <TrafficSignIcon key={sign.code} shape={sign.shape} glyph={sign.glyph} size={34} />
        ))}
      </span>
      <span className="sign-group-meta">{count} علامة</span>
    </button>
  );
}

function SignDetail({ sign, onClose }) {
  if (!sign) return null;
  return (
    <div className="sign-modal-backdrop" onClick={onClose}>
      <div className="sign-modal" onClick={(e) => e.stopPropagation()}>
        <button className="sign-modal-close" onClick={onClose} aria-label="إغلاق">x</button>
        <div className="sign-modal-header">
          <TrafficSignIcon shape={sign.shape} glyph={sign.glyph} size={96} />
          <div>
            <div className="sign-modal-code">{sign.code}</div>
            <div className="sign-modal-sv">{sign.swedishName}</div>
            <div className="sign-modal-ar">{sign.arabicName}</div>
            <div className="muted">{CATEGORY_CHIPS[sign.category] || sign.category} - {sign.categoryNameAr}</div>
          </div>
        </div>

        <div className="sign-modal-section">
          <h4>المعنى الرسمي</h4>
          <p>{sign.officialMeaning}</p>
        </div>

        {sign.trainingNote && (
          <div className="sign-modal-section sign-modal-training">
            <h4>ملاحظة تعليمية</h4>
            <p>{sign.trainingNote}</p>
          </div>
        )}

        <div className="sign-modal-source muted">المصدر: {sign.source}</div>
      </div>
    </div>
  );
}

export default function TrafficSigns() {
  const [groupId, setGroupId] = useState('warning');
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [openSign, setOpenSign] = useState(null);

  const activeGroup = SIGN_GROUPS.find((s) => s.id === groupId) || SIGN_GROUPS[0];

  const groupStats = useMemo(() => SIGN_GROUPS.map((group) => {
    const signs = trafficSigns.filter((sign) => group.categories.includes(sign.category));
    const featured = signs.filter((sign) => IMPORTANT_CODES.has(sign.code));
    return {
      ...group,
      count: signs.length,
      examples: (featured.length ? featured : signs).slice(0, 4),
    };
  }), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trafficSigns.filter((s) => {
      if (!activeGroup.categories.includes(s.category)) return false;
      if (category !== 'all' && s.category !== category) return false;
      if (!q) return true;
      return (
        s.code.toLowerCase().includes(q) ||
        s.swedishName.toLowerCase().includes(q) ||
        s.arabicName.includes(query.trim())
      );
    });
  }, [activeGroup, category, query]);

  const groupedResults = useMemo(() => activeGroup.categories
    .map((cat) => ({
      category: cat,
      label: CATEGORY_CHIPS[cat] || cat,
      signs: filtered.filter((sign) => sign.category === cat),
    }))
    .filter((item) => item.signs.length > 0), [activeGroup, filtered]);

  return (
    <div className="page page-wide traffic-signs-page">
      <div className="signs-hero">
        <div>
          <p className="signs-eyebrow">مرجع الشاخصات المرورية في السويد</p>
          <h1>الشاخصات المرورية في السويد</h1>
          <p>
            تبويب تعليمي منظم بنفس فروع المراجع العربية الشائعة للتيوري: يبدأ من التحذير والأولوية
            والمنع والإلزام، ثم الإرشاد، التوجيه، العلامات الأرضية، الإشارات الضوئية، واللوحات الإضافية.
          </p>
        </div>
        <div className="signs-hero-count">
          <strong>{trafficSigns.length}</strong>
          <span>علامة ورمز</span>
        </div>
      </div>

      <div className="signs-source-note">
        تم ترتيب الفروع على نمط Sweden4، مع اعتماد أسماء ورموز Transportstyrelsen في البيانات
        وتقديم شرح عربي مختصر داخل كل بطاقة.
      </div>

      <div className="sign-group-grid" aria-label="فروع الشاخصات المرورية">
        {groupStats.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            count={group.count}
            examples={group.examples}
            isActive={group.id === activeGroup.id}
            onSelect={() => { setGroupId(group.id); setCategory('all'); setQuery(''); }}
          />
        ))}
      </div>

      {groupId === 'markings' && (
        <p className="tp-disclaimer">
          هذه علامات مرسومة على سطح الطريق نفسه (Vägmarkeringar)، وليست شاخصات مثبتة على أعمدة.
          قد تستخدم إلى جانب شاخصة قائمة لتأكيد نفس القاعدة أو بشكل مستقل.
        </p>
      )}
      {['officers', 'devices', 'lights'].includes(groupId) && (
        <p className="tp-disclaimer">
          هذا الفرع يضم إشارات وأجهزة تنظيم حركة، وهي جزء من نظام المرور الرسمي حتى إن لم تكن شاخصة
          معدنية تقليدية على عمود.
        </p>
      )}

      <section className="signs-current-section">
        <div className="signs-section-heading">
          <div>
            <span className="signs-section-code">{activeGroup.code}</span>
            <h2>{activeGroup.label}</h2>
            <p>{activeGroup.summary}</p>
          </div>
          <span className="signs-section-count">{filtered.length} نتيجة</span>
        </div>
      </section>

      <div className="signs-toolbar">
        <input
          type="search"
          className="signs-search"
          placeholder="ابحث بالاسم العربي، الاسم السويدي، أو الرمز الرسمي مثل B2 أو STOP"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {activeGroup.categories.length > 1 && (
          <div className="signs-category-chips">
            <button className={`chip ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>الكل</button>
            {activeGroup.categories.map((c) => (
              <button key={c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
                {CATEGORY_CHIPS[c] || c}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="signs-results">
        {groupedResults.map((group) => (
          <section key={group.category} className="signs-result-group">
            <div className="signs-result-title">
              <h3>{group.label}</h3>
              <span>{group.signs.length} علامة</span>
            </div>
            <div className="signs-grid">
              {group.signs.map((s) => (
                <SignCard key={s.code} sign={s} onOpen={setOpenSign} />
              ))}
            </div>
          </section>
        ))}
        {filtered.length === 0 && <p className="muted">لا توجد نتائج مطابقة للبحث.</p>}
      </div>

      <SignDetail sign={openSign} onClose={() => setOpenSign(null)} />
    </div>
  );
}
