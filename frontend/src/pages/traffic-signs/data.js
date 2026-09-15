import { trafficSigns as allTrafficSigns } from '../../trafficSignsData';

export const SIGN_GROUPS = [
  { id: 'warning', label: 'شاخصات التحذير', code: 'A', categories: ['A'], sourceUrl: 'https://sweden4.com/?p=70677' },
  { id: 'priority', label: 'شاخصات الأولوية', code: 'B', categories: ['B'], sourceUrl: 'https://sweden4.com/?p=70706' },
  { id: 'prohibition', label: 'شاخصات المنع', code: 'C', categories: ['C'], sourceUrl: 'https://sweden4.com/?p=70744' },
  { id: 'mandatory', label: 'شاخصات إلزامية', code: 'D', categories: ['D'], sourceUrl: 'https://sweden4.com/?p=70820' },
  { id: 'guidance', label: 'شاخصات إرشادية', code: 'E', categories: ['E'], sourceUrl: 'https://sweden4.com/?p=70827' },
  { id: 'directions', label: 'شاخصات التوجيه للطرق', code: 'F', categories: ['F'], sourceUrl: 'https://sweden4.com/?p=70912' },
  { id: 'places', label: 'شاخصات مرافق وخدمات (G/H/I)', code: 'G-H-I', categories: ['G', 'H', 'I'], sourceUrl: 'https://sweden4.com/?p=70913' },
  { id: 'markings', label: 'العلامات الأرضية', code: 'M', categories: ['M'], sourceUrl: 'https://sweden4.com/?p=70914' },
  { id: 'lights', label: 'الإشارات الضوئية', code: 'SIG', categories: ['SIG'], sourceUrl: 'https://sweden4.com/?p=70915' },
  { id: 'police', label: 'إشارات الشرطي', code: 'P', categories: ['P'], sourceUrl: 'https://sweden4.com/?p=70916' },
  { id: 'devices', label: 'تجهيزات أخرى', code: 'X', categories: ['X'], sourceUrl: 'https://sweden4.com/?p=70917' },
  { id: 'additional', label: 'لوحات إضافية', code: 'T', categories: ['T'], sourceUrl: 'https://sweden4.com/?p=70918' },
];

const SOURCE_CATEGORY_SET = new Set(SIGN_GROUPS.flatMap((group) => group.categories));
export const trafficSigns = allTrafficSigns.filter((sign) => SOURCE_CATEGORY_SET.has(sign.category));

export const CATEGORY_CHIPS = {
  A: 'A - تحذير', B: 'B - أولوية', C: 'C - منع', D: 'D - إلزام', E: 'E - إرشاد',
  F: 'F - اتجاهات', G: 'G - مرافق عامة', H: 'H - خدمات', I: 'I - سياحة', J: 'J - معلومات',
  T: 'T - لوحات إضافية', M: 'M - خطوط الطريق', SIG: 'إشارات ضوئية',
  P: 'P - إشارات الشرطي', V: 'V - إشارات الحارس', X: 'X - أجهزة تنظيم', Y: 'Y - سكك حديد', S: 'S - رموز',
};

export const IMPORTANT_CODES = new Set(['B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C31', 'C35', 'C36', 'D1', 'D3', 'E1', 'E19', 'SIG1', 'SIG3']);

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
