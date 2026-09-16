import { trafficSigns } from '../trafficSignsData.js';

export const IMAGE_EXAM_QUESTION_COUNT = 40;

const INCLUDED_CATEGORIES = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'T']);

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

const conciseOverrides = {
  B1: 'واجب إفساح الطريق دون توقف إلزامي إذا كان الطريق خاليًا',
  B2: 'توقف إجباري كامل عند خط التوقف',
  B3: 'ممر مشاة مع الاستعداد للتوقف للمشاة',
  B4: 'طريق ذو أولوية يستمر عبر التقاطعات',
  B5: 'نهاية الطريق ذي الأولوية',
  B6: 'أنت تفسح الطريق لحركة المرور القادمة من المقابل',
  B7: 'الحركة القادمة من المقابل هي التي تفسح الطريق لك',
  B8: 'معبر دراجات هوائية له قواعد أولوية خاصة',
  C1: 'ممنوع دخول المركبات',
  C2: 'ممنوع حركة السير',
  C3: 'ممنوع مرور المركبات الآلية',
  C35: 'الركن Parkera ممنوع بعد الشاخصة',
  C36: 'الركن Parkera ممنوع في التاريخ الفردي',
  C37: 'الركن Parkera ممنوع في التاريخ الزوجي',
  C38: 'الركن حسب التاريخ Datumparkering',
  C39: 'نهاية منع الركن Parkera',
  E19: 'موقف سيارات Parkering',
  E20: 'بداية منطقة ذات قواعد خاصة',
  E21: 'نهاية منطقة ذات قواعد خاصة',
  E22: 'محطة حافلات',
  E23: 'موقف سيارات أجرة Taxi',
  E24: 'مستشفى',
  D1: 'اتجاه القيادة المرسوم إلزامي عند هذه النقطة',
  D2: 'المرور من الجهة أو المسار الذي تشير إليه العلامة إلزامي',
  D3: 'دوار: السير حول الجزيرة بالاتجاه المحدد إلزامي',
  D4: 'مسار أو طريق إلزامي لحافلات أو مركبات نقل منتظم',
  D5: 'رصيف أو مسار إلزامي للمشاة',
  D6: 'مسار إلزامي للدراجات الهوائية والموبيد الخفيف',
  D7: 'مسار إلزامي مشترك للمشاة والدراجات',
  D8: 'مسارات منفصلة إلزامية للمشاة والدراجات',
  D9: 'طريق إلزامي لراكبي الخيل',
  D10: 'اتجاه إلزامي للمركبات المحملة ببضائع خطرة',
  E1: 'بداية طريق سريع أوتوستراد',
  E2: 'نهاية الطريق السريع أو الأوتوستراد',
  E3: 'بداية طريق شبه سريع',
  E4: 'نهاية الطريق شبه السريع',
  E5: 'بداية منطقة مأهولة',
  E6: 'نهاية المنطقة المأهولة',
  E7: 'شارع مشاة بقواعد خاصة للمركبات',
  E8: 'نهاية شارع المشاة',
  E9: 'منطقة بسرعة المشي',
  E10: 'نهاية منطقة سرعة المشي',
  E11: 'سرعة موصى بها أقل من الحد الأقصى',
  E12: 'نهاية السرعة الموصى بها',
  E16: 'طريق باتجاه واحد',
  E17: 'طريق مسدود بلا منفذ',
  E18: 'مكان تلاق أو تجاوز على طريق ضيق',
  E27: 'مكان توقف طارئ على الطريق',
  E28: 'مخرج طوارئ',
  E29: 'طريق إخلاء عند الطوارئ',
  E30: 'أحكام خاصة بمواقف السيارات',
  E31: 'بداية منطقة بيئية',
  E32: 'نهاية المنطقة البيئية',
  F1: 'لائحة تحديد الاتجاهات نحو وجهات مختلفة',
  F2: 'طريق مناسب عند منع الانعطاف يسارًا في التقاطع القادم',
  F3: 'معلومات تحضيرية عن تقاطع أو دوار قادم',
  F4: 'مسافة الوصول إلى مسار الخروج من الأوتوستراد',
  F5: 'تحديد الموقع والمسافة على طريق عام',
  F6: 'شاخصة إرشادية قريبة من التقاطع',
  F7: 'إرشادات بعد المخرج من الأوتوستراد أو الطريق السريع',
  F8: 'مسارات القيادة المناسبة للوصول إلى الوجهة',
  F9: 'طريق مشترك يؤدي إلى أكثر من وجهة',
  F10: 'اسم منطقة أو مكان على الطريق',
  F11: 'اسم الطريق أو الطريق الفرعي',
  F12: 'اسم مجرى أو جدول مائي',
  F13: 'المسافات بالكيلومترات إلى الوجهات',
  F14: 'رقم الطريق الذي تسلكه أو تصل إليه',
  F15: 'تحويل مروري بسبب إغلاق أو عائق على الطريق',
  F16: 'زيادة أو تفرع حقل القيادة',
  F17: 'تقليل أو دمج حقول القيادة',
  F18: 'توزيع حقول القيادة على مسافة قادمة',
  F19: 'طريق ينتهي بحقل تسارع',
  F20: 'طريق ينتهي بحقول قيادة منفصلة',
  F21: 'إرشادات حقول القيادة قبل تقاطع الطريق',
  F22: 'حدود دولية ضمن السوق الأوروبية المشتركة',
  F23: 'شاخصة إرشادية مؤقتة',
  F24: 'اتجاه السير أثناء التحويل المروري',
  F25: 'انتهاء حقل القيادة',
  F26: 'حقل قيادة مغلق أمامك',
  F27: 'رقم المخرج من طريق الأوتوستراد أو الطريق السريع',
  F28: 'موقف لركن العربات',
  F29: 'موقف للسيارة مع انتقال إلى قطار أو نقل مشترك',
  F30: 'طريق دائري محلي',
  F31: 'طريق مناسب لنوع مركبة أو مجموعة مستخدمين',
  F31a: 'مسار مناسب لقطارات المركبات الطويلة',
  F32: 'طريق مخصص للمركبات المحملة ببضائع خطرة',
  F33: 'مكان مخصص للإنقاذ أو الإغاثة',
  F34: 'شاخصة توجيه إلى طريق للمشاة أو الدراجات',
  F35: 'شاخصة جدولية للمشاة أو الدراجات',
  F36: 'اسم مدينة أو منطقة لتعيين الاتجاه',
  F37: 'شاخصة مسافة للمشاة أو الدراجات',
  F38: 'مسلك للدراجات الهوائية',
};

const preferredDistractorCodes = {
  A1: ['A2', 'A8', 'A10', 'A30'],
  A2: ['A1', 'A8', 'A10', 'A30'],
  A3: ['A4', 'A5', 'A8', 'A10'],
  A4: ['A3', 'A5', 'A8', 'A10'],
  A5: ['A3', 'A4', 'A8', 'A9'],
  A6: ['A7', 'A22', 'A25', 'A26'],
  A7: ['A6', 'A25', 'A26', 'A40'],
  A8: ['A9', 'A10', 'A11', 'A27'],
  A9: ['A8', 'A10', 'A11', 'A27'],
  A10: ['A8', 'A9', 'A11', 'A24'],
  A11: ['A8', 'A9', 'A10', 'A12'],
  A12: ['A11', 'A27', 'A29', 'A40'],
  A13: ['A14', 'A15', 'A16', 'A17'],
  A14: ['A13', 'A15', 'A16', 'A17'],
  A15: ['A13', 'A14', 'A16', 'A17'],
  A16: ['A13', 'A14', 'A15', 'A17'],
  A17: ['A13', 'A14', 'A15', 'A16'],
  A18: ['A19', 'A31', 'A32', 'A33'],
  A19: ['A18', 'A31', 'A32', 'A33'],
  A20: ['A21', 'A34', 'A40', 'A9'],
  A21: ['A20', 'A34', 'A40', 'A9'],
  A22: ['A25', 'A28', 'A29', 'A30'],
  A23: ['A24', 'A25', 'A26', 'A40'],
  A24: ['A23', 'A25', 'A26', 'A40'],
  A25: ['A22', 'A23', 'A24', 'A26'],
  A26: ['A6', 'A7', 'A23', 'A25'],
  A27: ['A8', 'A9', 'A11', 'A12'],
  A28: ['A29', 'A30', 'A22', 'B1'],
  A29: ['A28', 'A30', 'B1', 'B3'],
  A30: ['A28', 'A29', 'B1', 'B3'],
  A31: ['A18', 'A19', 'A32', 'A33'],
  A32: ['A18', 'A19', 'A31', 'A33'],
  A33: ['A18', 'A19', 'A31', 'A32'],
  A34: ['A20', 'A21', 'A40', 'A25'],
  A35: ['A36', 'A37', 'A38', 'A39'],
  A36: ['A35', 'A37', 'A38', 'A39'],
  A37: ['A35', 'A36', 'A38', 'A39'],
  A38: ['A35', 'A36', 'A37', 'A39'],
  A39: ['A35', 'A36', 'A37', 'A38'],
  A40: ['A20', 'A21', 'A23', 'A34'],
  A41: ['A18', 'A19', 'A31', 'A32'],
  B1: ['B2', 'B3', 'B4', 'B5'],
  B2: ['B1', 'B3', 'B4', 'B5'],
  B3: ['B1', 'B2', 'B4', 'B5'],
  B4: ['B1', 'B2', 'B3', 'B5'],
  B5: ['B1', 'B2', 'B3', 'B4'],
  B6: ['B7', 'B1', 'B2', 'B3'],
  B7: ['B6', 'B1', 'B2', 'B3'],
  B8: ['B3', 'B4', 'B5', 'B6'],
  C1: ['C2', 'C3', 'C4', 'C5'],
  C2: ['C1', 'C3', 'C4', 'C5'],
  C3: ['C2', 'C4', 'C5', 'C6'],
  C4: ['C3', 'C5', 'C6', 'C7'],
  C5: ['C3', 'C4', 'C6', 'C7'],
  C6: ['C3', 'C4', 'C5', 'C7'],
  C7: ['C3', 'C4', 'C5', 'C6'],
  C8: ['C9', 'C10', 'C11', 'C12'],
  C9: ['C8', 'C10', 'C11', 'C12'],
  C10: ['C8', 'C9', 'C11', 'C12'],
  C11: ['C8', 'C9', 'C10', 'C12'],
  C12: ['C8', 'C9', 'C10', 'C11'],
  C13: ['C14', 'C15', 'C16', 'C17'],
  C14: ['C13', 'C15', 'C16', 'C17'],
  C15: ['C13', 'C14', 'C16', 'C17'],
  C16: ['C13', 'C14', 'C15', 'C17'],
  C17: ['C13', 'C14', 'C15', 'C16'],
  C18: ['C19', 'C20', 'C21', 'C22'],
  C19: ['C18', 'C20', 'C21', 'C22'],
  C20: ['C18', 'C19', 'C21', 'C22'],
  C21: ['C18', 'C19', 'C20', 'C22'],
  C22: ['C18', 'C19', 'C20', 'C21'],
  C23: ['C24', 'C25', 'C26', 'C27'],
  C24: ['C23', 'C25', 'C26', 'C27'],
  C25: ['C23', 'C24', 'C26', 'C27'],
  C26: ['C23', 'C24', 'C25', 'C27'],
  C27: ['C23', 'C24', 'C25', 'C26'],
  C28: ['C29', 'C30', 'C31', 'C32'],
  C29: ['C28', 'C30', 'C31', 'C32'],
  C30: ['C28', 'C29', 'C31', 'C32'],
  C31: ['C28', 'C29', 'C30', 'C32'],
  C32: ['C28', 'C29', 'C30', 'C31'],
  C33: ['C34', 'C35', 'C36', 'C37'],
  C34: ['C33', 'C35', 'C36', 'C37'],
  C35: ['C36', 'C37', 'C38', 'C39'],
  C36: ['C35', 'C37', 'C38', 'C39'],
  C37: ['C35', 'C36', 'C38', 'C39'],
  C38: ['C35', 'C36', 'C37', 'C39'],
  C39: ['C35', 'C36', 'C37', 'C38'],
  C40: ['C35', 'C36', 'C37', 'C39'],
  C41: ['C27', 'C28', 'C29', 'C40'],
  D1: ['D2', 'D3', 'D4', 'D5'],
  D2: ['D1', 'D3', 'D4', 'D5'],
  D3: ['D1', 'D2', 'D4', 'D5'],
  D4: ['D1', 'D2', 'D3', 'D5'],
  D5: ['D1', 'D2', 'D3', 'D4'],
  D6: ['D7', 'D8', 'D9', 'D10'],
  D7: ['D6', 'D8', 'D9', 'D10'],
  D8: ['D6', 'D7', 'D9', 'D10'],
  D9: ['D6', 'D7', 'D8', 'D10'],
  D10: ['D6', 'D7', 'D8', 'D9'],
  E1: ['E2', 'E3', 'E4', 'E5'],
  E2: ['E1', 'E3', 'E4', 'E5'],
  E3: ['E1', 'E2', 'E4', 'E5'],
  E4: ['E1', 'E2', 'E3', 'E5'],
  E5: ['E1', 'E2', 'E3', 'E4'],
  E6: ['E7', 'E8', 'E9', 'E10'],
  E7: ['E6', 'E8', 'E9', 'E10'],
  E8: ['E6', 'E7', 'E9', 'E10'],
  E9: ['E6', 'E7', 'E8', 'E10'],
  E10: ['E6', 'E7', 'E8', 'E9'],
  E11: ['E12', 'E13', 'E14', 'E15'],
  E12: ['E11', 'E13', 'E14', 'E15'],
  E13: ['E11', 'E12', 'E14', 'E15'],
  E14: ['E11', 'E12', 'E13', 'E15'],
  E15: ['E11', 'E12', 'E13', 'E14'],
  E16: ['E17', 'E18', 'E19', 'E23'],
  E17: ['E16', 'E18', 'E19', 'E23'],
  E18: ['E16', 'E17', 'E19', 'E23'],
  E19: ['E16', 'E17', 'E18', 'E23'],
  E20: ['E21', 'E9', 'E10', 'E11', 'E19'],
  E21: ['E20', 'E9', 'E10', 'E11', 'E19'],
  E22: ['E23', 'E24', 'E25', 'E26'],
  E23: ['E22', 'E24', 'E25', 'E26'],
  E24: ['E22', 'E23', 'E25', 'E26'],
  E25: ['E22', 'E23', 'E24', 'E26'],
  E26: ['E22', 'E23', 'E24', 'E25'],
  E27: ['E28', 'E29', 'E30', 'E31'],
  E28: ['E27', 'E29', 'E30', 'E31'],
  E29: ['E27', 'E28', 'E30', 'E31'],
  E30: ['E27', 'E28', 'E29', 'E31'],
  E31: ['E27', 'E28', 'E29', 'E30'],
  E32: ['E20', 'E21', 'E30', 'E31'],
  F4: ['F5', 'F7', 'F13', 'F27'],
  F5: ['F4', 'F7', 'F10', 'F13'],
  F7: ['F4', 'F5', 'F8', 'F27'],
  F8: ['F16', 'F17', 'F18', 'F21'],
  F13: ['F5', 'F10', 'F11', 'F37'],
  F15: ['F23', 'F24', 'F25', 'F26'],
  F16: ['F17', 'F18', 'F21', 'F25'],
  F17: ['F16', 'F18', 'F21', 'F25'],
  F18: ['F16', 'F17', 'F21', 'F8'],
  F21: ['F16', 'F17', 'F18', 'F8'],
  F24: ['F15', 'F23', 'F25', 'F26'],
  F25: ['F16', 'F17', 'F24', 'F26'],
  F26: ['F15', 'F24', 'F25', 'F27'],
  F27: ['F4', 'F7', 'F25', 'F26'],
  F28: ['F29', 'E19', 'E20', 'F30'],
  F29: ['F28', 'E19', 'E20', 'F30'],
  F31: ['F31a', 'F32', 'F34', 'F38'],
  F31a: ['F31', 'F32', 'F34', 'F38'],
  F34: ['F35', 'F36', 'F37', 'F38'],
  F35: ['F34', 'F36', 'F37', 'F38'],
  F36: ['F34', 'F35', 'F37', 'F38'],
  F37: ['F34', 'F35', 'F36', 'F38'],
  F38: ['F34', 'F35', 'F36', 'F37'],
  G1: ['G2', 'G3', 'G4', 'G5'],
  G2: ['G1', 'G3', 'G4', 'G5'],
  G3: ['G1', 'G2', 'G4', 'G5'],
  G4: ['G1', 'G2', 'G3', 'G5'],
  G5: ['G1', 'G2', 'G3', 'G4'],
  G6: ['G7', 'G8', 'G9', 'G10'],
  G7: ['G6', 'G8', 'G9', 'G10'],
  G8: ['G6', 'G7', 'G9', 'G10'],
  G9: ['G6', 'G7', 'G8', 'G10'],
  G10: ['G6', 'G7', 'G8', 'G9'],
  G11: ['G1', 'G3', 'G6', 'G12'],
  G12: ['G1', 'G3', 'G6', 'G11'],
  T1: ['T2', 'T3', 'T4', 'T5'],
  T2: ['T1', 'T3', 'T4', 'T5'],
  T3: ['T1', 'T2', 'T4', 'T5'],
  T4: ['T1', 'T2', 'T3', 'T5'],
  T5: ['T1', 'T2', 'T3', 'T4'],
  T6: ['T1', 'T2', 'T5', 'T7'],
  T7: ['T8', 'T9', 'T10', 'T11'],
  T8: ['T7', 'T9', 'T10', 'T11'],
  T9: ['T7', 'T8', 'T10', 'T11'],
  T10: ['T7', 'T8', 'T9', 'T11'],
  T11: ['T7', 'T8', 'T9', 'T10'],
};

function stripLongParentheses(text) {
  return text.replace(/\s*\(([^)]*)\)/g, (_, inner) => {
    if (/Parkera|Stanna|Datum|P\b/.test(inner)) return ` ${inner}`;
    if (inner.length <= 12) return ` (${inner})`;
    return '';
  });
}

function compactOptionText(sign) {
  let text = conciseOverrides[sign.code] || sign.arabicName || '';
  text = normalizeText(stripLongParentheses(text));
  text = text
    .replace(/^تحذير\s+من\s+/, 'تحذير: ')
    .replace(/^منع\s+وقوف\s+المركبات/, 'ممنوع الركن Parkera')
    .replace(/^منع\s+حركة\s+/, 'ممنوع مرور ')
    .replace(/^منع\s+مرور\s+/, 'ممنوع مرور ')
    .replace(/\s+وذلك.*$/, '')
    .replace(/\s+ما لم.*$/, '')
    .replace(/\s+بحسب.*$/, (match) => (text.length > 70 ? '' : match));

  if (text.length > 82 && text.includes('،')) {
    text = text.split('،')[0];
  }
  if (text.length > 82 && text.includes(' - ')) {
    text = text.split(' - ')[0];
  }
  if (text.length > 92) {
    text = `${text.slice(0, 88).trim()}…`;
  }
  return normalizeText(text);
}

function questionTextFor(sign) {
  if (sign.category === 'A') return 'ماذا تحذر هذه الشاخصة؟';
  if (sign.category === 'B') return 'ماذا يسري عند هذه الشاخصة؟';
  if (sign.category === 'D') return 'ماذا توجب هذه الشاخصة؟';
  if (sign.category === 'T') return 'ماذا تعني اللوحة الإضافية؟';
  return 'ماذا تعني هذه الشاخصة؟';
}

const signPool = trafficSigns
  .filter((sign) => (
    INCLUDED_CATEGORIES.has(sign.category)
    && sign.image
    && sign.arabicName
    && sign.officialMeaning
  ))
  .map((sign, index) => ({ ...sign, bankOrder: index }));

const signsByCategory = signPool.reduce((acc, sign) => {
  if (!acc[sign.category]) acc[sign.category] = [];
  acc[sign.category].push(sign);
  return acc;
}, {});

function pickDistractors(sign, textGetter, count = 3) {
  const correct = textGetter(sign);
  const sameCategory = signsByCategory[sign.category] || [];
  const preferred = (preferredDistractorCodes[sign.code] || [])
    .map((code) => signPool.find((item) => item.code === code))
    .filter(Boolean);
  const candidates = [
    ...preferred,
    ...shuffle(sameCategory.filter((item) => item.code !== sign.code)),
    ...shuffle(signPool.filter((item) => item.category !== sign.category)),
  ];

  const seen = new Set([correct]);
  const result = [];
  for (const candidate of candidates) {
    const text = textGetter(candidate);
    if (!text || seen.has(text)) continue;
    seen.add(text);
    result.push(text);
    if (result.length === count) break;
  }
  return result;
}

function buildOptions(correctText, distractors) {
  return shuffle([
    { text: correctText, correct: true },
    ...distractors.map((text) => ({ text, correct: false })),
  ]);
}

function buildQuestion(sign) {
  const correctText = compactOptionText(sign);
  const options = buildOptions(correctText, pickDistractors(sign, compactOptionText));
  const correctIndex = options.findIndex((option) => option.correct);
  const meaning = normalizeText(sign.officialMeaning);
  const note = normalizeText(sign.trainingNote);

  return {
    id: `image-${sign.code.toLowerCase()}`,
    groupId: `sign-${sign.category}`,
    groupName: sign.categoryNameAr || 'الشاخصات المرورية',
    signCode: sign.code,
    text: questionTextFor(sign),
    imageUrl: sign.image,
    imageAlt: sign.imageAlt || sign.arabicName,
    options: options.map((option) => option.text),
    correctIndex,
    explanation: note ? `${meaning} ${note}` : meaning,
    difficulty: 'medium',
  };
}

export function getImageQuestionBank() {
  return signPool.map(buildQuestion);
}

export function getImageQuestionBankStats() {
  const groups = new Set(signPool.map((sign) => sign.category));
  return {
    total: signPool.length,
    groups: groups.size,
  };
}

export function getLastImageExamQuestionIds(uid) {
  try {
    const raw = localStorage.getItem(`imagePracticeExam:last:${uid}`);
    const ids = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

export function saveImageExamAttempt(user, result, durationUsedSeconds) {
  try {
    const takenAt = new Date().toISOString();
    const key = `imagePracticeExam:attempts:${user.uid}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const attempt = {
      id: `image-attempt-${Date.now()}`,
      userId: user.uid,
      takenAt,
      durationUsedSeconds,
      score: result.score,
      total: result.total,
      percentage: result.percentage,
      passed: result.passed,
      questions: result.questions.map((q) => ({
        id: q.id,
        signCode: q.signCode,
        selectedIndex: q.selectedIndex,
        isCorrect: q.isCorrect,
      })),
    };
    localStorage.setItem(key, JSON.stringify([attempt, ...existing].slice(0, 20)));
    localStorage.setItem(
      `imagePracticeExam:last:${user.uid}`,
      JSON.stringify(result.questions.map((q) => q.id)),
    );
  } catch {
    /* التخزين المحلي اختياري ولا يجب أن يمنع ظهور النتيجة. */
  }
}

export function generateImagePracticeExam(recentIds = new Set()) {
  const bank = getImageQuestionBank();
  const fresh = shuffle(bank.filter((question) => !recentIds.has(question.id)));
  const repeated = shuffle(bank.filter((question) => recentIds.has(question.id)));
  const selected = [...fresh, ...repeated].slice(0, IMAGE_EXAM_QUESTION_COUNT);

  return {
    questions: selected.map((question, index) => ({ ...question, questionOrder: index + 1 })),
    totalQuestions: selected.length,
    bankSize: bank.length,
  };
}

export function gradeImagePracticeExam(examQuestions, answers) {
  let correct = 0;
  const categoryScores = {};
  const gradedQuestions = examQuestions.map((question) => {
    const selectedIndex = answers[question.id] ?? null;
    const isCorrect = selectedIndex !== null && selectedIndex === question.correctIndex;
    if (isCorrect) correct += 1;
    if (!categoryScores[question.groupId]) categoryScores[question.groupId] = { correct: 0, total: 0 };
    categoryScores[question.groupId].total += 1;
    if (isCorrect) categoryScores[question.groupId].correct += 1;
    return { ...question, selectedIndex, isCorrect };
  });

  const total = examQuestions.length;
  const percentage = total ? Math.round((correct / total) * 100) : 0;
  return {
    questions: gradedQuestions,
    score: correct,
    total,
    percentage,
    passed: percentage >= 70,
    categoryScores,
    unansweredCount: gradedQuestions.filter((question) => question.selectedIndex === null).length,
    incorrectCount: gradedQuestions.filter((question) => question.selectedIndex !== null && !question.isCorrect).length,
  };
}
