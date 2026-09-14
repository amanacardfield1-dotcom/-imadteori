// تصنيف بنك الأسئلة الجديد (questionBankV2) إلى 26 مجموعة معرفية حقيقية.
//
// طريقة البناء: هذا التصنيف ليس نسخة من "26 اختبارًا" الموجودة على sweden4.com
// (تلك في الواقع 26 امتحانًا تجريبيًا كاملاً مختلط المواضيع، وليست 26 فئة
// معرفية متمايزة — تم التحقق من هذا مباشرة بزيارة 10 من صفحاتها الفعلية
// واستخراج قائمة المفاهيم التي تقيسها كل صفحة، دون نسخ أي نص أسئلة).
// بدل ذلك: استُخرجت المفاهيم المتكررة فعليًا عبر تلك العينة (~650 مفهومًا)،
// ثم نُظّمت في 26 مجموعة معرفية حقيقية متوافقة مع التصنيف الرسمي الخماسي
// لـ Trafikverket (Trafikregler / Trafiksäkerhet / Fordonskännedom / Miljö /
// Personliga förutsättningar)، مع أوزان تعكس التكرار الفعلي الملاحظ (مثلاً
// "الوقوف والتوقف" و"الأولوية والتقاطعات" و"السرعة والمسافة" كانت الأكثر
// تكرارًا في كل عينة تقريبًا، فأُعطيت أوزانًا أعلى).
const questionBankV2Groups = [
  { id: 'group-01', number: 1, name: 'الأولوية والتقاطعات', slug: 'right-of-way-intersections', legacyCategory: 'regler', weight: 0.07, poolTarget: 12, description: 'قواعد الأولوية عند التقاطعات المنظمة وغير المنظمة، الدوارات، ومواقف إعطاء الطريق أو التوقف الإجباري.' },
  { id: 'group-02', number: 2, name: 'الشاخصات ومعانيها', slug: 'road-signs', legacyCategory: 'regler', weight: 0.05, poolTarget: 10, description: 'قراءة الشاخصات الأساسية وفهم أثرها القانوني ونطاق سريانها أثناء القيادة.' },
  { id: 'group-03', number: 3, name: 'السرعة والمسافة', slug: 'speed-distance', legacyCategory: 'regler', weight: 0.06, poolTarget: 12, description: 'السرعة المناسبة، مسافة رد الفعل، مسافة الكبح، والمسافة الكلية للتوقف.' },
  { id: 'group-04', number: 4, name: 'التجاوز وتغيير المسار', slug: 'overtaking-lane-change', legacyCategory: 'regler', weight: 0.05, poolTarget: 10, description: 'التجاوز الآمن، خطوط الطريق، مناطق منع التجاوز، والعودة إلى المسار.' },
  { id: 'group-05', number: 5, name: 'الوقوف والتوقف', slug: 'stopping-parking', legacyCategory: 'regler', weight: 0.06, poolTarget: 12, description: 'الفرق بين التوقف والوقوف، الوقوف بالتاريخ، أقراص الوقوف، ومناطق المنع.' },
  { id: 'group-06', number: 6, name: 'الطرق السريعة والطرق الخاصة', slug: 'motorways-special-roads', legacyCategory: 'regler', weight: 0.03, poolTarget: 8, description: 'الأوتوستراد، الطرق شبه السريعة، مناطق المشاة، والمناطق السكنية.' },
  { id: 'group-07', number: 7, name: 'السلامة وهوامش الأمان', slug: 'safety-margins', legacyCategory: 'sakerhet', weight: 0.05, poolTarget: 10, description: 'اختيار التصرف الآمن، ترك مسافة كافية، وقراءة المخاطر المبكرة.' },
  { id: 'group-08', number: 8, name: 'المخاطر والرؤية', slug: 'risk-visibility', legacyCategory: 'sakerhet', weight: 0.04, poolTarget: 10, description: 'المنعطفات، قمم التلال، النقاط العمياء، وسوء الرؤية.' },
  { id: 'group-09', number: 9, name: 'القيادة الليلية والطقس', slug: 'night-weather', legacyCategory: 'sakerhet', weight: 0.04, poolTarget: 10, description: 'الظلام، المطر، الضباب، الثلج والجليد وتأثيرها على القرار.' },
  { id: 'group-10', number: 10, name: 'المشاة والدراجات والأطفال', slug: 'vulnerable-road-users', legacyCategory: 'sakerhet', weight: 0.04, poolTarget: 10, description: 'التعامل مع مستخدمي الطريق الضعفاء قرب الممرات والمدارس والمسارات.' },
  { id: 'group-11', number: 11, name: 'الحوادث والطوارئ', slug: 'accidents-emergencies', legacyCategory: 'sakerhet', weight: 0.04, poolTarget: 10, description: 'التصرف عند العطل أو الحادث، مركبات الطوارئ، والإسعافات الأولية الأساسية.' },
  { id: 'group-12', number: 12, name: 'السائق الدفاعي', slug: 'defensive-driving', legacyCategory: 'sakerhet', weight: 0.03, poolTarget: 8, description: 'توقع أخطاء الآخرين، تقليل المخاطر، واتخاذ القرار الهادئ.' },
  { id: 'group-13', number: 13, name: 'معرفة المركبة الأساسية', slug: 'vehicle-basics', legacyCategory: 'fordon', weight: 0.03, poolTarget: 8, description: 'أجزاء المركبة، لوحة القيادة، وأضواء التحذير التي يحتاجها كل سائق.' },
  { id: 'group-14', number: 14, name: 'الإطارات والفرامل والثبات', slug: 'tires-brakes-stability', legacyCategory: 'fordon', weight: 0.04, poolTarget: 10, description: 'الإطارات، ضغط الهواء، الفرامل، الثبات، وأنظمة المساعدة (ABS/ESC).' },
  { id: 'group-15', number: 15, name: 'الحمولة والمقطورة', slug: 'load-trailer', legacyCategory: 'fordon', weight: 0.04, poolTarget: 10, description: 'توزيع الحمولة، تثبيتها، المقطورات، ورخص جرّها.' },
  { id: 'group-16', number: 16, name: 'التأمين والوثائق والفحص', slug: 'insurance-documents-inspection', legacyCategory: 'fordon', weight: 0.03, poolTarget: 8, description: 'التأمين الإلزامي، التسجيل، الفحص الدوري (Besiktning)، ومسؤولية المالك.' },
  { id: 'group-17', number: 17, name: 'تقنيات وأنظمة السيارة', slug: 'vehicle-technology', legacyCategory: 'fordon', weight: 0.03, poolTarget: 8, description: 'أنظمة المساعدة الحديثة وحدود الاعتماد عليها أثناء القيادة.' },
  { id: 'group-18', number: 18, name: 'القيادة الاقتصادية', slug: 'eco-driving', legacyCategory: 'miljo', weight: 0.03, poolTarget: 8, description: 'تخفيض الاستهلاك والانبعاثات دون الإضرار بالسلامة.' },
  { id: 'group-19', number: 19, name: 'البيئة والانبعاثات', slug: 'environment-emissions', legacyCategory: 'miljo', weight: 0.04, poolTarget: 10, description: 'الوقود، الانبعاثات، الضجيج، وأثر المركبة على البيئة.' },
  { id: 'group-20', number: 20, name: 'اختيار المركبة والصيانة البيئية', slug: 'vehicle-choice-maintenance-environment', legacyCategory: 'miljo', weight: 0.02, poolTarget: 8, description: 'اختيارات وصيانة تساعد على تقليل الأثر البيئي للمركبة.' },
  { id: 'group-21', number: 21, name: 'التخطيط للرحلة', slug: 'trip-planning', legacyCategory: 'miljo', weight: 0.02, poolTarget: 8, description: 'اختيار الطريق والوقت وطريقة القيادة لتقليل المخاطر والاستهلاك.' },
  { id: 'group-22', number: 22, name: 'الكحول والمخدرات والأدوية', slug: 'alcohol-drugs-medicine', legacyCategory: 'personliga', weight: 0.04, poolTarget: 10, description: 'تأثير الكحول والمخدرات والأدوية على القدرة على القيادة والمسؤولية القانونية.' },
  { id: 'group-23', number: 23, name: 'التعب والانتباه', slug: 'fatigue-attention', legacyCategory: 'personliga', weight: 0.03, poolTarget: 8, description: 'النوم، التركيز، رد الفعل، وعلامات الخطر على السائق المتعب.' },
  { id: 'group-24', number: 24, name: 'السلوك والضغط والتوتر', slug: 'behavior-stress', legacyCategory: 'personliga', weight: 0.03, poolTarget: 8, description: 'الغضب، الضغط، الثقة الزائدة، وتأثير الأقران على سلوك القيادة.' },
  { id: 'group-25', number: 25, name: 'المسؤولية القانونية والأخلاقية', slug: 'legal-ethical-responsibility', legacyCategory: 'personliga', weight: 0.03, poolTarget: 8, description: 'مسؤولية السائق تجاه الآخرين والقانون بعد الحوادث وأثناء القيادة اليومية.' },
  { id: 'group-26', number: 26, name: 'مراجعة شاملة وسيناريوهات مركبة', slug: 'mixed-review-scenarios', legacyCategory: 'regler', weight: 0.03, poolTarget: 8, description: 'أسئلة تجمع أكثر من مفهوم واحد كما يحدث فعليًا في مواقف القيادة الواقعية.' },
];

module.exports = { questionBankV2Groups };
