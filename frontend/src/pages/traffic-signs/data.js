import { trafficSigns } from '../../trafficSignsData';

// تصنيف مُعاد اكتشافه بالكامل من فهرس sweden4.com الحقيقي (?cat=436 — أرشيف
// التصنيف الكامل، وليس فقط الصفحة الرئيسية ?p=70940 التي فاتتها 3 صفحات:
// V وY وS). كل مجموعة هنا لها الآن sourceUrl فعلي تمت زيارته والتحقق منه
// مباشرة ضمن جولة إعادة البناء هذه، وليس افتراضًا موروثًا من عمل سابق.
export const SIGN_GROUPS = [
  { id: 'warning', label: 'شاخصات التحذير', code: 'A', categories: ['A'], sourceLabel: 'Varningsmärken', inReference: true, sourceUrl: 'https://sweden4.com/?p=70677', summary: 'تنبهك إلى خطر أو وضع خاص أمامك، والقاعدة العملية هي تخفيف السرعة وزيادة الانتباه قبل الوصول إليه.' },
  { id: 'priority', label: 'شاخصات الأولوية', code: 'B', categories: ['B'], sourceLabel: 'Väjningspliktsmärken', inReference: true, sourceUrl: 'https://sweden4.com/?p=70706', summary: 'تحدد من له حق المرور: إعطاء الأولوية، قف، الطريق الرئيسي، وتنظيم المرور المتقابل.' },
  { id: 'prohibition', label: 'شاخصات المنع', code: 'C', categories: ['C'], sourceLabel: 'Förbudsmärken', inReference: true, sourceUrl: 'https://sweden4.com/?p=70744', summary: 'تمنع دخولًا أو حركة أو سرعة أو توقفًا أو نوعًا معينًا من المركبات، وغالبًا تتغير تفاصيلها بلوحات إضافية.' },
  { id: 'mandatory', label: 'شاخصات إلزامية', code: 'D', categories: ['D'], sourceLabel: 'Påbudsmärken', inReference: true, sourceUrl: 'https://sweden4.com/?p=70820', summary: 'تجبر السائق أو مستخدم الطريق على اتجاه أو مسار أو استعمال محدد مثل الدوار، المشاة، الدراجات أو الحافلات.' },
  { id: 'guidance', label: 'شاخصات إرشادية', code: 'E', categories: ['E'], sourceLabel: 'Anvisningsmärken', inReference: true, sourceUrl: 'https://sweden4.com/?p=70827', summary: 'تشرح نوع الطريق أو المنطقة والقواعد العامة فيها، مثل الأوتوستراد، شارع المشاة، موقف السيارات أو منطقة السكن.' },
  { id: 'directions', label: 'شاخصات التوجيه للطرق', code: 'F', categories: ['F'], sourceLabel: 'Lokaliseringsmärken', inReference: true, sourceUrl: 'https://sweden4.com/?p=70912', summary: 'تساعدك على اختيار الاتجاه أو المخرج أو المسار الصحيح قبل التقاطعات والطرق السريعة والمناطق المختلفة.' },
  { id: 'places', label: 'شاخصات مرافق وخدمات (G/H/I)', code: 'G-H-I', categories: ['G', 'H', 'I'], sourceLabel: 'Lokaliseringsmärken för upplysning', inReference: true, sourceUrl: 'https://sweden4.com/?p=70913', summary: 'مرافق عامة وخدمات ومعالم سياحية: بريد، مستشفى، محطة قطار، محطة وقود، فنادق، تخييم، ملاعب غولف، مواقع تراث عالمي وغيرها.' },
  { id: 'markings', label: 'العلامات الأرضية', code: 'M', categories: ['M'], sourceLabel: 'Vägmarkeringar', inReference: true, sourceUrl: 'https://sweden4.com/?p=70914', summary: 'خطوط ورموز مرسومة على الطريق تحدد المسارات، الحواف، مناطق المنع، الوقوف، ممرات المشاة والدراجات.' },
  { id: 'lights', label: 'الإشارات الضوئية', code: 'SIG', categories: ['SIG'], sourceLabel: 'Trafiksignaler', inReference: true, sourceUrl: 'https://sweden4.com/?p=70915', summary: 'إشارات التقاطعات والعبور: الأحمر، الأصفر، الأخضر، الأسهم، إشارات المشاة، والإشارات الصوتية.' },
  { id: 'railway', label: 'إشارات تقاطعات السكك الحديدية والترام', code: 'Y', categories: ['Y'], sourceLabel: 'Signaler vid korsning med järnväg eller spårväg', inReference: true, sourceUrl: 'https://sweden4.com/?p=179599', summary: 'الضوء الأحمر الوامض، الإشارة الصوتية، والحواجز المستخدمة عند تقاطعات السكك الحديدية أو الترام.' },
  { id: 'police', label: 'إشارات الشرطي', code: 'P', categories: ['P'], sourceLabel: 'Tecken av polisman', inReference: true, sourceUrl: 'https://sweden4.com/?p=70916', summary: 'إشارات اليد التي يعطيها ضابط الشرطة مباشرة لتنظيم الحركة، ولها الأولوية على أي شاخصة أو إشارة ضوئية أخرى.' },
  { id: 'guard', label: 'إشارات الحارس', code: 'V', categories: ['V'], sourceLabel: 'Tecken av vakt', inReference: true, sourceUrl: 'https://sweden4.com/?p=179633', summary: 'إشارات يعطيها عامل أو حارس مخوَّل (كموقع أعمال الطريق) لتنظيم الحركة في تلك المنطقة تحديدًا.' },
  { id: 'devices', label: 'تجهيزات أخرى', code: 'X', categories: ['X'], sourceLabel: 'Andra anordningar för anvisningar för trafiken', inReference: true, sourceUrl: 'https://sweden4.com/?p=70917', summary: 'حواجز وأسهم ولوحات مؤقتة أو ثابتة تساعد على توجيه الحركة حول العوائق والتحويلات وأعمال الطريق.' },
  { id: 'additional', label: 'لوحات إضافية', code: 'T', categories: ['T'], sourceLabel: 'Tilläggstavlor', inReference: true, sourceUrl: 'https://sweden4.com/?p=70918', summary: 'تضيف تفاصيل للشاخصة الرئيسية مثل المسافة، المدة، الاتجاه، الوقت، الوزن أو الاستثناءات.' },
  { id: 'symbols', label: 'شاخصات الرموز', code: 'S', categories: ['S'], sourceLabel: 'Symboler', inReference: true, sourceUrl: 'https://sweden4.com/?p=179589', summary: 'رموز مختصرة لأنواع المركبات ومستخدمي الطريق (شاحنة، حافلة، جرار، دراجة، مشاة، ذوو إعاقة...)، تظهر عادة داخل شاخصات أو لوحات إضافية.' },
  { id: 'info', label: 'شاخصات معلومات', code: 'J', categories: ['J'], sourceLabel: 'Upplysningsmärken', inReference: false, sourceUrl: 'https://www.transportstyrelsen.se/sv/vagtrafik/trafikregler-och-vagmarken/vagmarken/upplysningsmarken/', summary: 'معلومات عملية للسائق. لم يُعثر على صفحة مقابلة لهذه الفئة ضمن أرشيف sweden4.com (?cat=436) رغم البحث الكامل — تم التحقق منها مباشرة من صفحة Transportstyrelsen الرسمية بدلًا من ذلك (J2 وJ3 مؤكَّدتان؛ J1 "علامة حدود وطنية" مذكورة في نص اللائحة لكن غير معروضة في الصفحة الرسمية الحالية ولا صورة رسمية مؤكَّدة لها، فلم تُضَف تجنبًا للتخمين).' },
];

export const CATEGORY_CHIPS = {
  A: 'A - تحذير', B: 'B - أولوية', C: 'C - منع', D: 'D - إلزام', E: 'E - إرشاد',
  F: 'F - اتجاهات', G: 'G - مرافق عامة', H: 'H - خدمات', I: 'I - سياحة', J: 'J - معلومات',
  T: 'T - لوحات إضافية', M: 'M - خطوط الطريق', SIG: 'إشارات ضوئية',
  P: 'P - إشارات الشرطي', V: 'V - إشارات الحارس', X: 'X - أجهزة تنظيم', Y: 'Y - سكك حديد', S: 'S - رموز',
};

export const IMPORTANT_CODES = new Set(['B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C31', 'C35', 'C36', 'D1', 'D3', 'E1', 'E19', 'SIG1', 'SIG3', 'Y1']);

export function getGroup(groupId) {
  return SIGN_GROUPS.find((g) => g.id === groupId);
}

export function getGroupSigns(group) {
  if (!group) return [];
  return trafficSigns.filter((sign) => group.categories.includes(sign.category));
}

export function getGroupForCode(code) {
  const sign = trafficSigns.find((s) => s.code === code);
  if (!sign) return null;
  return SIGN_GROUPS.find((g) => g.categories.includes(sign.category)) || null;
}

export function getSignByCode(code) {
  return trafficSigns.find((s) => s.code === code) || null;
}

export function matchesQuery(sign, q) {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    sign.code.toLowerCase().includes(needle) ||
    sign.swedishName.toLowerCase().includes(needle) ||
    sign.arabicName.toLowerCase().includes(needle) ||
    (sign.officialMeaning || '').toLowerCase().includes(needle)
  );
}

export function searchAllSigns(q) {
  return trafficSigns.filter((s) => matchesQuery(s, q));
}

export { trafficSigns };
