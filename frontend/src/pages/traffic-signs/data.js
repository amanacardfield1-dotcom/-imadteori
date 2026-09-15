import { trafficSigns } from '../../trafficSignsData';

// بنية المجموعات هذه رُوجعت ونُقّحت لتطابق تصنيف الشاخصات المرورية كما هو
// منشور فعليًا في القسم المرجعي المقابل على sweden4.com (12 صفحة تصنيف
// مستقلة + صفحتا "شاخصات ملحقة" مكررتان، جميعها زُحفت وقُورنت يدويًا)،
// وليس تصنيفًا مبتكرًا من عندنا.
// ملاحظة: مجموعات "places" (G/H/I)، "symbols" (S)، "info" (J) و"guard" (V)
// تصنيفات رسمية حقيقية من Transportstyrelsen لا توجد لها صفحة مستقلة في
// مرجع sweden4 — أُبقيت ظاهرة ومميزة (EXTRA / NOT IN REFERENCE) بدل حذفها.
export const SIGN_GROUPS = [
  { id: 'warning', label: 'شاخصات التحذير', code: 'A', categories: ['A'], sourceLabel: 'Varningsmärken', inReference: true, summary: 'تنبهك إلى خطر أو وضع خاص أمامك، والقاعدة العملية هي تخفيف السرعة وزيادة الانتباه قبل الوصول إليه.' },
  { id: 'priority', label: 'شاخصات الأولوية', code: 'B', categories: ['B'], sourceLabel: 'Väjningspliktsmärken', inReference: true, summary: 'تحدد من له حق المرور: إعطاء الأولوية، قف، الطريق الرئيسي، وتنظيم المرور المتقابل.' },
  { id: 'prohibition', label: 'شاخصات المنع', code: 'C', categories: ['C'], sourceLabel: 'Förbudsmärken', inReference: true, summary: 'تمنع دخولًا أو حركة أو سرعة أو توقفًا أو نوعًا معينًا من المركبات، وغالبًا تتغير تفاصيلها بلوحات إضافية.' },
  { id: 'mandatory', label: 'شاخصات إلزامية', code: 'D', categories: ['D'], sourceLabel: 'Påbudsmärken', inReference: true, summary: 'تجبر السائق أو مستخدم الطريق على اتجاه أو مسار أو استعمال محدد مثل الدوار، المشاة، الدراجات أو الحافلات.' },
  { id: 'guidance', label: 'شاخصات إرشادية', code: 'E', categories: ['E'], sourceLabel: 'Anvisningsmärken', inReference: true, summary: 'تشرح نوع الطريق أو المنطقة والقواعد العامة فيها، مثل الأوتوستراد، شارع المشاة، موقف السيارات أو منطقة السكن.' },
  { id: 'directions', label: 'شاخصات التوجيه للطرق', code: 'F', categories: ['F'], sourceLabel: 'Lokaliseringsmärken', inReference: true, summary: 'تساعدك على اختيار الاتجاه أو المخرج أو المسار الصحيح قبل التقاطعات والطرق السريعة والمناطق المختلفة.' },
  { id: 'places', label: 'شاخصات مرافق وخدمات إضافية', code: 'G-H-I', categories: ['G', 'H', 'I'], sourceLabel: 'محتوى تكميلي رسمي (Transportstyrelsen)', inReference: false, summary: 'مرافق عامة وخدمات ومعالم سياحية (مستشفى، محطة قطار، محطة وقود، مطعم...) — تصنيف رسمي مُضاف كتوسّع تعليمي، وليس جزءًا من تصنيف sweden4 نفسه.' },
  { id: 'markings', label: 'العلامات الأرضية', code: 'M', categories: ['M'], sourceLabel: 'Vägmarkeringar', inReference: true, summary: 'خطوط ورموز مرسومة على الطريق تحدد المسارات، الحواف، مناطق المنع، الوقوف، ممرات المشاة والدراجات.' },
  { id: 'lights', label: 'الإشارات الضوئية', code: 'SIG', categories: ['SIG'], sourceLabel: 'Trafiksignaler', inReference: true, summary: 'إشارات التقاطعات والعبور: الأحمر، الأصفر، الأخضر، الأسهم، إشارات المشاة، والإشارات الصوتية.' },
  { id: 'railway', label: 'إشارات تقاطعات السكك الحديدية والترام', code: 'Y', categories: ['Y'], sourceLabel: 'Signaler vid korsning med järnväg eller spårväg', inReference: false, summary: 'الضوء الأحمر الوامض، الإشارة الصوتية، والحواجز المستخدمة عند تقاطعات السكك الحديدية أو الترام.' },
  { id: 'police', label: 'إشارات الشرطي', code: 'P', categories: ['P'], sourceLabel: 'Tecken av polisman', inReference: true, summary: 'إشارات اليد التي يعطيها ضابط الشرطة مباشرة لتنظيم الحركة، ولها الأولوية على أي شاخصة أو إشارة ضوئية أخرى.' },
  { id: 'guard', label: 'إشارات الحارس', code: 'V', categories: ['V'], sourceLabel: 'Tecken av vakt', inReference: false, summary: 'إشارات يعطيها عامل أو حارس مخوَّل (كموقع أعمال الطريق) لتنظيم الحركة في تلك المنطقة تحديدًا.' },
  { id: 'devices', label: 'تجهيزات أخرى', code: 'X', categories: ['X'], sourceLabel: 'Andra anordningar för anvisningar för trafiken', inReference: true, summary: 'حواجز وأسهم ولوحات مؤقتة أو ثابتة تساعد على توجيه الحركة حول العوائق والتحويلات وأعمال الطريق.' },
  { id: 'additional', label: 'لوحات إضافية', code: 'T', categories: ['T'], sourceLabel: 'Tilläggstavlor', inReference: true, summary: 'تضيف تفاصيل للشاخصة الرئيسية مثل المسافة، المدة، الاتجاه، الوقت، الوزن أو الاستثناءات.' },
  { id: 'symbols', label: 'شاخصات الرموز', code: 'S', categories: ['S'], sourceLabel: 'Symboler', inReference: false, summary: 'رموز مختصرة لأنواع المركبات ومستخدمي الطريق، وتظهر عادة داخل شاخصات أو لوحات إضافية.' },
  { id: 'info', label: 'شاخصات معلومات', code: 'J', categories: ['J'], sourceLabel: 'Upplysningsmärken', inReference: false, summary: 'معلومات عملية للسائق مثل نهاية منطقة تمليح الطريق أو التحذير من خط كهرباء عالي الخطورة.' },
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
