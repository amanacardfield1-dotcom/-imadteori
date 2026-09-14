import { useMemo, useState } from 'react';
import { trafficSigns } from '../trafficSignsData';
import TrafficSignIcon from '../components/TrafficSignIcon';

// تُطابق فئات Transportstyrelsen الرسمية بحرفها. مقسّمة إلى 5 أقسام رئيسية
// حتى لا نخلط الشاخصات المثبتة على أعمدة (A-J) مع اللوحات الإضافية أو
// علامات الطريق الأرضية أو الإشارات الضوئية أو أدوات التنظيم الأخرى.
const SECTIONS = [
  { id: 'signs', label: 'الشاخصات الرئيسية (A–J)', categories: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] },
  { id: 'plaques', label: 'اللوحات الإضافية (T)', categories: ['T'] },
  { id: 'markings', label: 'علامات الطريق الأرضية (M)', categories: ['M'] },
  { id: 'signals', label: 'الإشارات الضوئية (SIG)', categories: ['SIG'] },
  { id: 'other', label: 'أدوات وإشارات تنظيم أخرى', categories: ['P', 'V', 'X', 'Y', 'S'] },
];

const CATEGORY_CHIPS = {
  A: 'A – تحذير', B: 'B – أولوية', C: 'C – منع', D: 'D – إلزام', E: 'E – إرشاد',
  F: 'F – اتجاهات', G: 'G – مرافق عامة', H: 'H – خدمات', I: 'I – سياحة', J: 'J – معلومات',
  T: 'T – لوحات إضافية', M: 'M – خطوط الطريق', SIG: 'إشارات ضوئية',
  P: 'P – إشارات الشرطة', V: 'V – إشارات المراقب', X: 'X – أجهزة تنظيم', Y: 'Y – سكك حديد', S: 'S – رموز',
};

function SignCard({ sign, onOpen }) {
  return (
    <button className="sign-card" onClick={() => onOpen(sign)}>
      <TrafficSignIcon shape={sign.shape} glyph={sign.glyph} size={56} />
      <div className="sign-card-code">{sign.code}</div>
      <div className="sign-card-sv">{sign.swedishName}</div>
      <div className="sign-card-ar">{sign.arabicName}</div>
    </button>
  );
}

function SignDetail({ sign, onClose }) {
  if (!sign) return null;
  return (
    <div className="sign-modal-backdrop" onClick={onClose}>
      <div className="sign-modal" onClick={(e) => e.stopPropagation()}>
        <button className="sign-modal-close" onClick={onClose} aria-label="إغلاق">✕</button>
        <div className="sign-modal-header">
          <TrafficSignIcon shape={sign.shape} glyph={sign.glyph} size={96} />
          <div>
            <div className="sign-modal-code">{sign.code}</div>
            <div className="sign-modal-sv">{sign.swedishName}</div>
            <div className="sign-modal-ar">{sign.arabicName}</div>
            <div className="muted">{CATEGORY_CHIPS[sign.category] || sign.category} — {sign.categoryNameAr}</div>
          </div>
        </div>

        <div className="sign-modal-section">
          <h4>المعنى الرسمي (Official Meaning)</h4>
          <p>{sign.officialMeaning}</p>
        </div>

        {sign.trainingNote && (
          <div className="sign-modal-section sign-modal-training">
            <h4>شرح تعليمي للمتدرب (Training Explanation)</h4>
            <p>{sign.trainingNote}</p>
          </div>
        )}

        <div className="sign-modal-source muted">المصدر: {sign.source}</div>
      </div>
    </div>
  );
}

export default function TrafficSigns() {
  const [sectionId, setSectionId] = useState('signs');
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [openSign, setOpenSign] = useState(null);

  const section = SECTIONS.find((s) => s.id === sectionId) || SECTIONS[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trafficSigns.filter((s) => {
      if (!section.categories.includes(s.category)) return false;
      if (category !== 'all' && s.category !== category) return false;
      if (!q) return true;
      return (
        s.code.toLowerCase().includes(q) ||
        s.swedishName.toLowerCase().includes(q) ||
        s.arabicName.includes(query.trim())
      );
    });
  }, [section, category, query]);

  return (
    <div className="page page-wide">
      <h1>الشاخصات المرورية في السويد</h1>
      <p className="muted">
        مرجع شامل لكل الشاخصات وعلامات وإشارات المرور السويدية الرسمية، مبني على التصنيف الرسمي
        الصادر من Transportstyrelsen وعلى Vägmärkesförordning (2007:90) — رقم كل علامة واسمها
        السويدي محفوظان كما هما رسميًا، مع شرح عربي واضح لكل واحدة ({trafficSigns.length} عنصرًا رسميًا).
      </p>

      <div className="signs-section-tabs">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className={`signs-section-tab ${s.id === sectionId ? 'active' : ''}`}
            onClick={() => { setSectionId(s.id); setCategory('all'); }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {sectionId === 'markings' && (
        <p className="tp-disclaimer">
          ⚠️ هذه علامات مرسومة على سطح الطريق نفسه (Vägmarkeringar) — وليست شاخصات مثبتة على أعمدة.
          قد تُستخدم إلى جانب شاخصة قائمة لتأكيد نفس القاعدة أو بشكل مستقل.
        </p>
      )}
      {sectionId === 'other' && (
        <p className="tp-disclaimer">
          ⚠️ هذا القسم يضم إشارات وأجهزة تنظيم مرور أخرى (إشارات رجل الشرطة، عامل المرور، أجهزة توجيه،
          إشارات تقاطعات السكك الحديدية، والرموز الرسمية) — وهي ليست "شاخصات طريق" تقليدية بالمعنى
          الضيق، لكنها جزء من نظام Transportstyrelsen الرسمي لتنظيم المرور.
        </p>
      )}

      <div className="signs-toolbar">
        <input
          type="search"
          className="signs-search"
          placeholder="ابحث بالاسم العربي، الاسم السويدي، أو الرمز الرسمي (مثال: STOP، توقف، B2)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="signs-category-chips">
          <button className={`chip ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>الكل</button>
          {section.categories.map((c) => (
            <button key={c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
              {CATEGORY_CHIPS[c] || c}
            </button>
          ))}
        </div>
      </div>

      <p className="muted">{filtered.length} نتيجة</p>

      <div className="signs-grid">
        {filtered.map((s) => (
          <SignCard key={s.code} sign={s} onOpen={setOpenSign} />
        ))}
        {filtered.length === 0 && <p className="muted">لا توجد نتائج مطابقة للبحث.</p>}
      </div>

      <SignDetail sign={openSign} onClose={() => setOpenSign(null)} />
    </div>
  );
}
