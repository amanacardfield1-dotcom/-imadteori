// نظام رسم مبسّط لشاخصات المرور السويدية: يعيد بناء الشكل واللون الرسمي لكل
// فئة (مثلث تحذير أحمر، دائرة منع حمراء، دائرة إلزام زرقاء...) بدقة، مع رمز
// داخلي تخطيطي (schematic) لكل شاخصة وليس نسخة بكسل مطابقة تمامًا للتصميم
// الرسمي المطبوع في ملحق SFS 2007:90 — لذلك يبقى الاسم الرسمي والرقم والمصدر
// هما المرجع القانوني، والأيقونة أداة بصرية مساعدة للتعرّف السريع فقط.

const RED = '#c0392b';
const BLUE = '#0a3d91';
const YELLOW = '#ffd400';
const BROWN = '#5b3a1e';
const BLACK = '#1b1f27';
const WHITE = '#ffffff';

function Center({ children }) {
  return <g transform="translate(32,32)">{children}</g>;
}

// ---------------------------------------------------------------------------
// حاويات الأشكال الرسمية (اللون + الشكل الخارجي لكل فئة)
// ---------------------------------------------------------------------------
function ShapeContainer({ shape, children }) {
  switch (shape) {
    case 'triangle-warning':
      return (
        <>
          <polygon points="32,6 60,56 4,56" fill={WHITE} stroke={RED} strokeWidth="5" strokeLinejoin="round" />
          <g transform="translate(0,4)">{children}</g>
        </>
      );
    case 'triangle-yield':
      return (
        <>
          <polygon points="32,58 60,8 4,8" fill={WHITE} stroke={RED} strokeWidth="5" strokeLinejoin="round" />
          <g transform="translate(0,-3)">{children}</g>
        </>
      );
    case 'octagon-stop': {
      const pts = octagonPoints(32, 32, 27);
      return (
        <>
          <polygon points={pts} fill={RED} stroke={WHITE} strokeWidth="2.5" />
          <text x="32" y="39" fontSize="15" fontWeight="800" fill={WHITE} textAnchor="middle" fontFamily="Arial, sans-serif">STOP</text>
        </>
      );
    }
    case 'diamond-priority':
      return (
        <>
          <rect x="14" y="14" width="36" height="36" fill={YELLOW} stroke={WHITE} strokeWidth="3" transform="rotate(45 32 32)" />
          <rect x="14" y="14" width="36" height="36" fill="none" stroke={BLACK} strokeWidth="1" transform="rotate(45 32 32)" />
          {children}
        </>
      );
    case 'diamond-priority-end':
      return (
        <>
          <rect x="14" y="14" width="36" height="36" fill={YELLOW} stroke={WHITE} strokeWidth="3" transform="rotate(45 32 32)" />
          <line x1="12" y1="52" x2="52" y2="12" stroke={BLACK} strokeWidth="5" opacity="0.75" />
        </>
      );
    case 'circle-prohibit-red':
      return (
        <>
          <circle cx="32" cy="32" r="27" fill={WHITE} stroke={RED} strokeWidth="6" />
          {children}
        </>
      );
    case 'circle-solid-red':
      return <circle cx="32" cy="32" r="27" fill={RED} stroke={WHITE} strokeWidth="2" />;
    case 'circle-prohibit-blue':
      return (
        <>
          <circle cx="32" cy="32" r="27" fill={BLUE} stroke={WHITE} strokeWidth="2" />
          {children}
          <line x1="10" y1="54" x2="54" y2="10" stroke={RED} strokeWidth="5" />
        </>
      );
    case 'circle-mandatory-blue':
      return (
        <>
          <circle cx="32" cy="32" r="28" fill={BLUE} />
          {children}
        </>
      );
    case 'rect-info-blue':
      return (
        <>
          <rect x="6" y="6" width="52" height="52" rx="6" fill={BLUE} />
          {children}
        </>
      );
    case 'rect-info-brown':
      return (
        <>
          <rect x="6" y="6" width="52" height="52" rx="6" fill={BROWN} />
          {children}
        </>
      );
    case 'plaque-white':
      return (
        <>
          <rect x="4" y="18" width="56" height="28" rx="3" fill={WHITE} stroke={BLACK} strokeWidth="2.5" />
          {children}
        </>
      );
    case 'roadmark':
      return (
        <>
          <rect x="2" y="2" width="60" height="60" rx="4" fill="#3b4048" />
          {children}
        </>
      );
    case 'signal':
      return (
        <>
          <rect x="18" y="4" width="28" height="56" rx="6" fill="#20242c" />
          {children}
        </>
      );
    case 'symbol-plate':
      return (
        <>
          <rect x="6" y="6" width="52" height="52" rx="4" fill={WHITE} stroke="#c7ccd3" strokeWidth="2" />
          {children}
        </>
      );
    case 'gesture':
      return (
        <>
          <circle cx="32" cy="32" r="28" fill="#eef1f5" stroke="#c7ccd3" strokeWidth="2" />
          {children}
        </>
      );
    case 'device':
      return (
        <>
          <rect x="4" y="4" width="56" height="56" rx="8" fill="#eef1f5" stroke="#c7ccd3" strokeWidth="2" />
          {children}
        </>
      );
    case 'cross-marker':
      return (
        <g stroke={WHITE} strokeWidth="0">
          <line x1="8" y1="8" x2="56" y2="56" stroke={RED} strokeWidth="7" />
          <line x1="56" y1="8" x2="8" y2="56" stroke={RED} strokeWidth="7" />
        </g>
      );
    default:
      return <rect x="4" y="4" width="56" height="56" rx="8" fill="#eef1f5" />;
  }
}

function octagonPoints(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 8) + (i * Math.PI) / 4;
    pts.push(`${(cx + r * Math.sin(a)).toFixed(1)},${(cy - r * Math.cos(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

// ---------------------------------------------------------------------------
// عناصر بنائية أساسية معاد استخدامها في عشرات الرموز
// ---------------------------------------------------------------------------
function Car({ c = BLACK }) {
  return <path d="M -12,3 q0,-7 6,-7 h12 q6,0 6,7 v5 h-24 z M -9,8 a3,3 0 1,0 0.1,0 M 9,8 a3,3 0 1,0 0.1,0" fill={c} />;
}
function Truck({ c = BLACK }) {
  return <path d="M -14,-6 h16 v11 h-16 z M 4,0 h9 l4,5 v5 h-13 z M -10,10 a3,3 0 1,0 .1,0 M 12,10 a3,3 0 1,0 .1,0" fill={c} />;
}
function Bus({ c = BLACK }) {
  return <path d="M -14,-9 h28 v16 h-28 z M -10,10 a3,3 0 1,0 .1,0 M 10,10 a3,3 0 1,0 .1,0" fill={c} />;
}
function Motorcycle({ c = BLACK }) {
  return (
    <g fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round">
      <circle cx="-9" cy="9" r="4.5" />
      <circle cx="9" cy="9" r="4.5" />
      <path d="M -9,9 L -2,-3 L 6,-3 L 9,9 M -2,-3 L 2,9" />
    </g>
  );
}
function Bicycle({ c = BLACK }) {
  return (
    <g fill="none" stroke={c} strokeWidth="3" strokeLinecap="round">
      <circle cx="-9" cy="9" r="6" />
      <circle cx="9" cy="9" r="6" />
      <path d="M -9,9 L -2,-4 L 9,9 M -2,-4 L 2,-4 M -2,-4 L -6,9" />
    </g>
  );
}
function Moped({ c = BLACK }) {
  return (
    <g fill="none" stroke={c} strokeWidth="3" strokeLinecap="round">
      <circle cx="-9" cy="9" r="5" />
      <circle cx="9" cy="9" r="5" />
      <path d="M -9,9 L 0,-2 L 9,9 M 0,-2 L 0,-7 L 6,-7" />
    </g>
  );
}
function Tractor({ c = BLACK }) {
  return (
    <g fill="none" stroke={c} strokeWidth="3" strokeLinecap="round">
      <circle cx="7" cy="9" r="7" />
      <circle cx="-9" cy="11" r="4" />
      <path d="M -13,2 h8 v-6 h6 M -1,-4 v-3" />
    </g>
  );
}
function Trailer({ c = BLACK }) {
  return <path d="M -11,-5 h20 v11 h-20 z M -6,9 a3,3 0 1,0 .1,0 M 6,9 a3,3 0 1,0 .1,0" fill={c} />;
}
function Pedestrian({ c = BLACK }) {
  return (
    <g fill={c}>
      <circle cx="0" cy="-9" r="4.5" />
      <path d="M -6,-2 h12 v10 l-4,10 h-3 l1,-9 l-3,0 l1,9 h-3 l-4,-10 z" />
    </g>
  );
}
function Children({ c = BLACK }) {
  return (
    <g fill={c}>
      <circle cx="-7" cy="-6" r="4" />
      <path d="M -11,0 h8 v7 l-2,7 h-2 l0.5,-6 h-1 l0.5,6 h-2 z" />
      <circle cx="7" cy="-9" r="4.5" />
      <path d="M 2,-2 h10 v9 l-3,8 h-2.5 l1,-7.5 h-1 l1,7.5 h-2.5 z" />
    </g>
  );
}
function HorseRider({ c = BLACK }) {
  return (
    <g fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M -14,10 q4,-14 14,-14 q10,0 12,8 l4,6 M -14,10 l3,3 M -4,10 l0,4 M 4,10 l0,4" />
      <circle cx="4" cy="-6" r="3.4" fill={c} stroke="none" />
    </g>
  );
}
function Skier({ c = BLACK }) {
  return (
    <g fill="none" stroke={c} strokeWidth="3" strokeLinecap="round">
      <circle cx="0" cy="-10" r="4" fill={c} stroke="none" />
      <path d="M 0,-5 L -3,8 M 0,-5 L 6,4 M -3,3 L 6,-2 M -12,11 L 6,11 M 6,11 L 14,7" />
    </g>
  );
}
function Animal({ c = BLACK }) {
  return (
    <g fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M -14,10 L -14,2 L -8,-6 L 4,-6 L 10,0 L 14,10 M -14,2 L -10,2 M 4,-6 L 2,-11 L 6,-11 L 4,-6" />
      <path d="M -11,10 L -11,14 M -6,10 L -6,14 M 6,10 L 6,14 M 10,10 L 10,14" />
    </g>
  );
}
function HorseCart({ c = BLACK }) {
  return (
    <g fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round">
      <path d="M -16,8 Q -10,-8 0,-2 L 4,8" />
      <circle cx="10" cy="9" r="5" />
      <path d="M 4,4 h8" />
    </g>
  );
}
function Snowmobile({ c = BLACK }) {
  return (
    <g fill="none" stroke={c} strokeWidth="3" strokeLinecap="round">
      <path d="M -13,9 L -6,9 L 2,-3 L 12,-3 M -13,9 L -13,12 M 2,9 L 12,9 L 12,4" />
    </g>
  );
}
function ArrowIcon({ c = WHITE, rot = 0, double = false }) {
  return (
    <g transform={`rotate(${rot})`} fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M 0,14 L 0,-14 M -8,-6 L 0,-14 L 8,-6" />
      {double && <path d="M 0,2 L -8,10 M 0,2 L 8,10" />}
    </g>
  );
}
function ExclaimIcon({ c = BLACK }) {
  return (
    <g fill={c}>
      <rect x="-2.4" y="-14" width="4.8" height="16" rx="2" />
      <circle cx="0" cy="8" r="3" />
    </g>
  );
}
function Dot({ c = RED, blink = false }) {
  return (
    <g>
      <circle cx="0" cy="0" r="10" fill={c} opacity={blink ? 0.55 : 1} />
      {blink && <circle cx="0" cy="0" r="13" fill="none" stroke={c} strokeWidth="1.5" />}
    </g>
  );
}
function LineDiagram({ style = 'solid', color = WHITE }) {
  const common = { stroke: color, strokeWidth: 5, strokeLinecap: 'round' };
  if (style === 'dashed') return <line x1="0" y1="-24" x2="0" y2="24" strokeDasharray="8 6" {...common} />;
  if (style === 'double') return (
    <g>
      <line x1="-4" y1="-24" x2="-4" y2="24" {...common} />
      <line x1="4" y1="-24" x2="4" y2="24" {...common} />
    </g>
  );
  if (style === 'warning') return <line x1="0" y1="-24" x2="0" y2="24" strokeDasharray="14 4" {...common} />;
  if (style === 'edge') return <line x1="0" y1="-24" x2="0" y2="24" strokeWidth="3" stroke={color} />;
  return <line x1="0" y1="-24" x2="0" y2="24" {...common} />;
}
function TextGlyph({ text, c = WHITE, size = 16 }) {
  return (
    <text x="0" y={size * 0.35} fontSize={size} fontWeight="800" fill={c} textAnchor="middle" fontFamily="Arial, sans-serif">
      {text}
    </text>
  );
}
function HandFigure({ arm = 'stop', c = BLACK }) {
  const arms = {
    stop: 'M -3,-4 L -14,-10 M 3,-4 L 14,-10',
    forward: 'M -3,-4 L -14,2 M 3,-4 L 14,2',
    slow: 'M -3,-4 L -14,-2 M 3,-4 L 14,4',
    control: 'M -3,-4 L -14,-10 M 3,-4 L 3,-14',
    follow: 'M -3,-4 L -14,2 M 3,-4 L 14,-10',
    pullover: 'M -3,-4 L -14,-10 M 3,-4 L 14,2',
  };
  return (
    <g fill={c} stroke={c} strokeWidth="3" strokeLinecap="round">
      <circle cx="0" cy="-14" r="4" stroke="none" />
      <path d={`M 0,-9 L 0,10 ${arms[arm] || arms.stop}`} fill="none" />
      <path d="M -4,10 L -6,20 M 4,10 L 6,20" fill="none" />
    </g>
  );
}
function Ferry({ c = WHITE }) {
  return <path d="M -14,4 L 14,4 L 10,12 L -10,12 Z M -8,4 L -8,-8 L 8,-8 L 8,4" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />;
}
function Wheelchair({ c = WHITE }) {
  return (
    <g fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round">
      <circle cx="4" cy="10" r="9" />
      <circle cx="-6" cy="-11" r="3.4" fill={c} stroke="none" />
      <path d="M -6,-6 L -6,4 L 6,4 M -3,4 L 2,-4 L 10,-4" />
    </g>
  );
}
function GenericBox({ c = WHITE }) {
  return <rect x="-9" y="-9" width="18" height="18" rx="3" fill="none" stroke={c} strokeWidth="3" />;
}

// ---------------------------------------------------------------------------
// خريطة الرموز الداخلية: كل مفتاح glyph → JSX يُرسم مركّزًا داخل الحاوية
// ---------------------------------------------------------------------------
function glyphContent(glyph, shape) {
  const onColor = shape.startsWith('circle-prohibit') || shape === 'triangle-warning' || shape === 'triangle-yield' || shape === 'symbol-plate' || shape === 'gesture' || shape === 'device' ? BLACK : WHITE;
  const g = (el) => <Center>{el}</Center>;

  const simple = {
    car: <Car c={onColor} />, truck: <Truck c={onColor} />, bus: <Bus c={onColor} />,
    motorcycle: <Motorcycle c={onColor} />, bicycle: <Bicycle c={onColor} />, moped: <Moped c={onColor} />,
    tractor: <Tractor c={onColor} />, trailer: <Trailer c={onColor} />, snowmobile: <Snowmobile c={onColor} />,
    pedestrian: <Pedestrian c={onColor} />, children: <Children c={onColor} />, 'horse-rider': <HorseRider c={onColor} />,
    skier: <Skier c={onColor} />, animal: <Animal c={onColor} />, 'horse-cart': <HorseCart c={onColor} />,
    wheelchair: <Wheelchair c={onColor} />, ferry: <Ferry c={onColor} />,
    'motor-multi': <Motorcycle c={onColor} />, hazmat: (
      <g transform="rotate(45)"><rect x="-9" y="-9" width="18" height="18" fill={onColor} /></g>
    ),
    'no-entry-bar': <rect x="-16" y="-4.5" width="32" height="9" rx="2" fill={onColor} />,
    'no-vehicles': (
      <g transform="scale(0.85)">
        <g transform="translate(-6,3)"><Car c={onColor} /></g>
        <g transform="translate(7,-6)"><Motorcycle c={onColor} /></g>
      </g>
    ),
    exclaim: <ExclaimIcon c={onColor} />,
    'cross-x': (
      <g stroke={RED} strokeWidth="5" strokeLinecap="round">
        <line x1="-13" y1="-13" x2="13" y2="13" /><line x1="13" y1="-13" x2="-13" y2="13" />
      </g>
    ),
    'high-voltage': <path d="M -3,-14 L -10,2 L -1,2 L -6,14 L 12,-4 L 2,-4 Z" fill={onColor} />,
    barrier: <rect x="-16" y="-3" width="32" height="6" rx="2" fill={onColor} transform="rotate(-18)" />,
    screen: <rect x="-12" y="-14" width="24" height="24" rx="2" fill="none" stroke={onColor} strokeWidth="3" />,
    'post-marker': <rect x="-2.5" y="-16" width="5" height="32" fill={onColor} />,
    badge: <path d="M 0,-14 L 12,-6 L 8,12 L -8,12 L -12,-6 Z" fill="none" stroke={onColor} strokeWidth="3" />,
    'info-i': (
      <g fill={onColor}><circle cx="0" cy="-9" r="3" /><rect x="-2.4" y="-3" width="4.8" height="15" rx="2" /></g>
    ),
    star: <path d="M0,-14 L4,-4 L15,-4 L6,3 L9,14 L0,7 L-9,14 L-6,3 L-15,-4 L-4,-4 Z" fill={onColor} />,
    landmark: <path d="M -12,12 L 12,12 L 8,-10 L -8,-10 Z M -4,12 L -4,0 M 4,12 L 4,0" fill="none" stroke={onColor} strokeWidth="2.6" strokeLinejoin="round" />,
    hospital: (
      <g fill={onColor}><rect x="-3" y="-13" width="6" height="26" /><rect x="-13" y="-3" width="26" height="6" /></g>
    ),
    extinguisher: <path d="M -3,-14 L 5,-10 M -1,-10 h4 v18 a5,5 0 0 1 -10,0 v-10 a6,4 0 0 1 6,-8 Z" fill="none" stroke={onColor} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />,
    wrench: <path d="M -10,10 L 2,-2 M -6,-10 a5,5 0 1 0 7,7 L 10,6 a4,4 0 0 1 -6,6 L -1,3" fill="none" stroke={onColor} strokeWidth="3" strokeLinecap="round" />,
    fuel: <path d="M -6,12 L -6,-8 L 6,-8 L 6,12 M -6,-8 L 2,-14 L 8,-8 L 8,4 a3,3 0 0 1 -6,0" fill="none" stroke={onColor} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />,
    gas: <path d="M 0,14 C -8,4 -8,-4 0,-14 C 8,-4 8,4 0,14 Z" fill="none" stroke={onColor} strokeWidth="2.8" strokeLinejoin="round" />,
    'ev-plug': <path d="M -6,-4 v-8 M 6,-4 v-8 M -8,-4 h16 v8 a8,8 0 0 1 -16,0 z" fill="none" stroke={onColor} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />,
    phone: <path d="M -8,-11 q-2,10 6,18 q8,8 18,6 l1,-6 l-7,-3 l-3,3 q-5,-3 -8,-8 l3,-3 l-3,-7 Z" fill={onColor} />,
    posthorn: <path d="M -10,10 C -14,-4 -2,-16 10,-12 C 2,-8 -2,0 0,10 Z" fill="none" stroke={onColor} strokeWidth="2.6" strokeLinejoin="round" />,
    industry: <path d="M -14,12 L -14,-2 L -8,2 L -8,-6 L -2,-2 L -2,-8 L 6,-2 L 6,12 Z" fill={onColor} />,
    train: <path d="M -8,10 L -10,14 M 8,10 L 10,14 M -10,10 L -10,-8 a10,6 0 0 1 20,0 L 10,10 Z M -10,0 L 10,0" fill="none" stroke={onColor} strokeWidth="2.6" strokeLinejoin="round" />,
    airplane: <path d="M 0,-14 L 3,-2 L 14,4 L 14,7 L 3,4 L 3,9 L 7,12 L 7,14 L 0,12 L -7,14 L -7,12 L -3,9 L -3,4 L -14,7 L -14,4 L -3,-2 Z" fill={onColor} />,
    shop: <path d="M -12,-4 L -10,-12 L 10,-12 L 12,-4 M -12,-4 L -12,12 L 12,12 L 12,-4 M -12,-4 L 12,-4 M -4,12 L -4,2 L 4,2 L 4,12" fill="none" stroke={onColor} strokeWidth="2.4" strokeLinejoin="round" />,
    radio: <path d="M 0,10 L 0,-2 M -8,-10 a12,12 0 0 1 16,0 M -4,-6 a6,6 0 0 1 8,0" fill="none" stroke={onColor} strokeWidth="2.6" strokeLinecap="round" />,
    toilet: <g fill={onColor}><circle cx="-6" cy="-9" r="3" /><path d="M -9,-4 h6 v6 l-2,8 h-2 l1,-7 h-1 l1,7 h-2 z" /><circle cx="6" cy="-9" r="3" /><path d="M 3,-4 h6 v14 h-2 v-6 h-2 v6 h-2 z" /></g>,
    bed: <path d="M -13,12 L -13,-4 L 13,-4 L 13,12 M -13,4 L 13,4 M -9,-4 L -9,-8 L -2,-8 L -2,-4" fill="none" stroke={onColor} strokeWidth="2.4" strokeLinejoin="round" />,
    cabin: <path d="M -11,12 L -11,-2 L 0,-13 L 11,-2 L 11,12 Z M -4,12 L -4,3 L 4,3 L 4,12" fill="none" stroke={onColor} strokeWidth="2.4" strokeLinejoin="round" />,
    tent: <path d="M 0,-13 L 12,12 L -12,12 Z M 0,-13 L 0,12" fill="none" stroke={onColor} strokeWidth="2.6" strokeLinejoin="round" />,
    caravan: <path d="M -13,10 L -13,-2 a4,4 0 0 1 4,-4 L 9,-6 L 13,2 L 13,10 Z M -13,10 L 13,10" fill="none" stroke={onColor} strokeWidth="2.4" strokeLinejoin="round" />,
    picnic: <path d="M -12,4 L 12,4 M -9,4 L -12,12 M 9,4 L 12,12 M -12,-4 L 12,-4 M 0,-4 L 0,4" fill="none" stroke={onColor} strokeWidth="2.6" strokeLinecap="round" />,
    swim: <path d="M -13,6 q4,5 8,0 q4,-5 8,0 q4,5 8,0 M -3,-2 a4,4 0 1 0 0.1,0" fill="none" stroke={onColor} strokeWidth="2.6" strokeLinecap="round" />,
    hiker: <Pedestrian c={onColor} />,
    chairlift: <path d="M -12,-12 L 12,12 M -4,-2 L -10,4 M -4,-2 L -8,-8" fill="none" stroke={onColor} strokeWidth="2.6" strokeLinecap="round" />,
    towlift: <path d="M -12,-12 L 12,12 M 4,2 L 10,-2" fill="none" stroke={onColor} strokeWidth="2.6" strokeLinecap="round" />,
    golf: <path d="M -6,12 L -6,-13 L 8,-8 L -6,-3" fill="none" stroke={onColor} strokeWidth="2.6" strokeLinejoin="round" />,
    fish: <path d="M -12,0 Q -4,-8 8,0 Q -4,8 -12,0 Z M 8,0 L 13,-4 L 13,4 Z" fill="none" stroke={onColor} strokeWidth="2.4" strokeLinejoin="round" />,
    craft: <path d="M -8,10 L 4,-2 M -2,-10 a4,4 0 1 0 6,6 L 10,4 a3,3 0 0 1 -4,4 L -1,-1" fill="none" stroke={onColor} strokeWidth="2.8" strokeLinecap="round" />,
    route: <path d="M -12,10 Q 0,-14 12,10" fill="none" stroke={onColor} strokeWidth="3" strokeDasharray="5 4" strokeLinecap="round" />,
    'area-generic': <rect x="-11" y="-11" width="22" height="22" rx="3" fill="none" stroke={onColor} strokeWidth="3" />,
    heritage: <circle cx="0" cy="0" r="12" fill="none" stroke={onColor} strokeWidth="3" />,
    tunnel: <path d="M -13,10 L -13,0 a13,13 0 0 1 26,0 L 13,10" fill="none" stroke={onColor} strokeWidth="4" strokeLinecap="round" />,
    bridge: <path d="M -14,6 Q 0,-10 14,6 M -14,6 L -14,10 M 14,6 L 14,10" fill="none" stroke={onColor} strokeWidth="3" strokeLinecap="round" />,
    quay: <path d="M -14,2 L 14,2 M -14,2 L -14,12 M 14,2 L 14,12 M -14,-2 L -6,-10 L 2,-2 Z" fill="none" stroke={onColor} strokeWidth="2.8" strokeLinejoin="round" />,
    roundabout: <path d="M 0,0 m -13,0 a13,13 0 1 0 26,0 a13,13 0 1 0 -26,0" fill="none" stroke={onColor} strokeWidth="4" />,
    'roundabout-arrow': (
      <g fill="none" stroke={onColor} strokeWidth="3.6" strokeLinecap="round">
        <circle cx="0" cy="0" r="12" />
        <path d="M 12,0 l4,-3 l0,6 z" />
      </g>
    ),
    crossroads: <path d="M 0,-13 L 0,13 M -13,0 L 13,0" fill="none" stroke={onColor} strokeWidth="4" strokeLinecap="round" />,
    'crossroads-priority': (
      <g stroke={onColor} strokeWidth="4" strokeLinecap="round">
        <line x1="0" y1="-13" x2="0" y2="13" />
        <line x1="-13" y1="0" x2="13" y2="0" strokeWidth="2" strokeDasharray="3 3" />
      </g>
    ),
    'oncoming-traffic': (
      <g fill={onColor}>
        <g transform="translate(-8,0)"><Car c={onColor} /></g>
        <g transform="translate(8,0) scale(-1,1)"><Car c={onColor} /></g>
      </g>
    ),
    queue: (
      <g transform="scale(0.72)">
        <g transform="translate(-14,0)"><Car c={onColor} /></g>
        <g transform="translate(0,0)"><Car c={onColor} /></g>
        <g transform="translate(14,0)"><Car c={onColor} /></g>
      </g>
    ),
    'rail-gated': <path d="M -13,-13 L 13,13 M 13,-13 L -13,13 M -16,4 h10" fill="none" stroke={onColor} strokeWidth="3.4" strokeLinecap="round" />,
    'rail-ungated': <path d="M -13,-13 L 13,13 M 13,-13 L -13,13" fill="none" stroke={onColor} strokeWidth="3.4" strokeLinecap="round" />,
    'tram-ungated': <path d="M -13,-13 L 13,13 M 13,-13 L -13,13 M -6,6 a6,6 0 1 0 0.1,0" fill="none" stroke={onColor} strokeWidth="3" strokeLinecap="round" />,
    'rail-distance': <g>{[-10, 0, 10].map((x) => <line key={x} x1={x} y1="-10" x2={x} y2="10" stroke={onColor} strokeWidth="3" />)}</g>,
    accident: <ExclaimIcon c={onColor} />,
    'no-turn': (
      <g>
        <ArrowIcon c={onColor} rot={90} />
        <line x1="-14" y1="14" x2="14" y2="-14" stroke={RED} strokeWidth="4.5" />
      </g>
    ),
    'no-uturn': (
      <g>
        <path d="M -6,10 L -6,-4 a8,8 0 1 1 16,0 M 10,-4 L 10,-10 M 10,-4 L 4,-4" fill="none" stroke={onColor} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="-14" y1="14" x2="14" y2="-14" stroke={RED} strokeWidth="4.5" />
      </g>
    ),
    'no-overtake': (
      <g transform="scale(0.85)">
        <g transform="translate(-6,3)"><Car c={BLACK} /></g>
        <g transform="translate(7,-6)"><Car c={RED} /></g>
      </g>
    ),
    'no-overtake-truck': (
      <g transform="scale(0.8)">
        <g transform="translate(-6,4)"><Truck c={BLACK} /></g>
        <g transform="translate(8,-7)"><Car c={RED} /></g>
      </g>
    ),
    'width': <TextGlyph text="2,6 m" c={onColor} size={13} />,
    'height': <TextGlyph text="4,0 m" c={onColor} size={13} />,
    'length': <TextGlyph text="12 m" c={onColor} size={13} />,
    'distance': <TextGlyph text="10 m" c={onColor} size={13} />,
    'weight': <TextGlyph text="10 t" c={onColor} size={14} />,
    'axle': <TextGlyph text="8 t" c={onColor} size={14} />,
    'bearing-class': <TextGlyph text="BK1" c={onColor} size={13} />,
    'speed-number': <TextGlyph text="50" c={onColor} size={20} />,
    'road-number': <TextGlyph text="40" c={onColor} size={16} />,
    'speed-reco': <TextGlyph text="30" c={onColor} size={18} />,
    'speed-reco-max': <TextGlyph text="70" c={onColor} size={18} />,
    'clock': <TextGlyph text="⏱" c={onColor} size={16} />,
    'clock24': <TextGlyph text="24h" c={onColor} size={14} />,
    'coin': <TextGlyph text="kr" c={onColor} size={16} />,
    'disc': <circle cx="0" cy="0" r="11" fill="none" stroke={onColor} strokeWidth="3" />,
    'resident': <TextGlyph text="Boende" c={onColor} size={11} />,
    'ticket': <path d="M -11,-6 h22 v12 h-22 z M -3,-6 v12 M 3,-6 v12" fill="none" stroke={onColor} strokeWidth="2.4" />,
    'eye': <path d="M -12,0 Q 0,-9 12,0 Q 0,9 -12,0 Z M 0,0 a3,3 0 1 0 0.1,0" fill="none" stroke={onColor} strokeWidth="2.6" strokeLinejoin="round" />,
    'ear': <path d="M -2,-12 Q 10,-12 10,0 Q 10,10 0,10 Q -6,10 -6,4 Q -6,0 -2,0" fill="none" stroke={onColor} strokeWidth="2.8" strokeLinecap="round" />,
    'tunnel-cat': <TextGlyph text="B" c={onColor} size={18} />,
    'text': <TextGlyph text="…" c={onColor} size={18} />,
    'purpose-place': <TextGlyph text="P" c={onColor} size={20} />,
    'turning-place': <ArrowIcon c={onColor} rot={180} double />,
    'special-parking': <TextGlyph text="P" c={onColor} size={20} />,
    'studded-tire': <TextGlyph text="⊘" c={onColor} size={18} />,
    'stop-purpose': <TextGlyph text="STOP" c={onColor} size={11} />,
    'customs': <TextGlyph text="TULL" c={onColor} size={10} />,
    'stop-text': <TextGlyph text="STOP" c={onColor} size={13} />,
    'taxi-text': <TextGlyph text="TAXI" c={onColor} size={13} />,
    'camera': <path d="M -11,-3 h6 l2,-3 h6 l2,3 h6 v11 h-22 z M 0,2 a5,5 0 1 0 0.1,0" fill="none" stroke={onColor} strokeWidth="2.4" strokeLinejoin="round" />,
    'toll': <TextGlyph text="kr" c={onColor} size={16} />,
    'urban-area': <path d="M -12,10 L -12,-2 L -4,-9 L 4,-2 L 4,10 M 6,10 L 6,0 L 12,-4 L 12,10" fill="none" stroke={onColor} strokeWidth="2.2" strokeLinejoin="round" />,
    'motorway': (
      <g fill="none" stroke={onColor} strokeWidth="3" strokeLinecap="round">
        <path d="M -6,12 L -6,-12 M 6,12 L 6,-12" />
        <path d="M -6,-12 L -12,-4 M 6,-12 L 12,-4" />
      </g>
    ),
    'expressway': (
      <g fill="none" stroke={onColor} strokeWidth="3" strokeLinecap="round">
        <path d="M 0,12 L 0,-12 M 0,-12 L -7,-4 M 0,-12 L 7,-4" />
      </g>
    ),
    'pedestrian-street': <Pedestrian c={onColor} />,
    'walking-speed': <TextGlyph text="Gångfart" c={onColor} size={9} />,
    'merge': <path d="M -12,10 L 0,-2 L 12,10 M 0,-2 L 0,-12" fill="none" stroke={onColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />,
    'one-way': <ArrowIcon c={onColor} rot={90} />,
    'dead-end': <path d="M -12,0 h20 M 4,-8 v16" fill="none" stroke={onColor} strokeWidth="4" strokeLinecap="round" />,
    'passing-place': (
      <g fill="none" stroke={onColor} strokeWidth="3" strokeLinecap="round">
        <path d="M -12,-6 h24 M -12,6 h24 M 6,-6 l6,6 l-6,6" />
      </g>
    ),
    'parking-p': <TextGlyph text="P" c={onColor} size={24} />,
    'area-end': <rect x="-11" y="-11" width="22" height="22" rx="3" fill="none" stroke={onColor} strokeWidth="3" />,
    'eco-zone': <TextGlyph text="MILJÖ" c={onColor} size={9} />,
    'bicycle-street': <Bicycle c={onColor} />,
    'emergency-bay': <TextGlyph text="SOS" c={onColor} size={13} />,
    'emergency-exit': (
      <g>
        <Pedestrian c={onColor} />
        <ArrowIcon c={onColor} rot={90} />
      </g>
    ),
    'evac-route': <ArrowIcon c={onColor} rot={90} />,
    'hazmat-arrow': <ArrowIcon c={onColor} rot={0} />,
    'bus-lane': <Bus c={onColor} />,
    'pedestrian-bicycle': (
      <g transform="scale(0.75)">
        <g transform="translate(-9,0)"><Pedestrian c={onColor} /></g>
        <g transform="translate(9,0)"><Bicycle c={onColor} /></g>
      </g>
    ),
    'pedestrian-bicycle-sep': (
      <g transform="scale(0.75)">
        <g transform="translate(-9,-4)"><Pedestrian c={onColor} /></g>
        <line x1="-15" y1="6" x2="15" y2="6" stroke={onColor} strokeWidth="1.5" />
        <g transform="translate(9,10)"><Bicycle c={onColor} /></g>
      </g>
    ),
    'arrow-forced': <ArrowIcon c={onColor} rot={0} />,
    'arrow-lane': <ArrowIcon c={onColor} rot={0} />,
    'arrow-yield': <ArrowIcon c={RED} rot={45} />,
    'arrow-yield-rev': <ArrowIcon c={RED} rot={-45} />,
    'arrow-extent': <ArrowIcon c={onColor} rot={90} double />,
    'arrow-direction': <ArrowIcon c={onColor} rot={0} />,
    'arrow-ped-bike': <ArrowIcon c={onColor} rot={0} />,
    'lane-arrows': (
      <g transform="scale(0.7)">
        <g transform="translate(-12,0)"><ArrowIcon c={onColor} rot={0} /></g>
        <g transform="translate(12,0)"><ArrowIcon c={onColor} rot={30} /></g>
      </g>
    ),
    'lane-change': <ArrowIcon c={onColor} rot={25} />,
    'lane-end': <ArrowIcon c={onColor} rot={25} />,
    'road-continue': <path d="M -12,10 L -2,-10 M 2,-10 L 12,10" fill="none" stroke={onColor} strokeWidth="3" strokeLinecap="round" />,
    'yield-multi': (
      <g transform="scale(0.6)">
        {[0, 90, 180, 270].map((r) => <g key={r} transform={`rotate(${r})`}><polygon points="0,-16 6,-8 -6,-8" fill={RED} /></g>)}
      </g>
    ),
    'stop-multi': (
      <g transform="scale(0.55)">
        {[0, 90, 180, 270].map((r) => <g key={r} transform={`rotate(${r})`}><polygon points="0,-18 6,-10 -6,-10" fill={RED} /></g>)}
      </g>
    ),
    'no-stop-park': (
      <g>
        <TextGlyph text="P" c={onColor} size={18} />
        <line x1="-14" y1="14" x2="14" y2="-14" stroke={onColor} strokeWidth="3" />
      </g>
    ),
    cutlery: <path d="M -8,-12 v10 M -11,-12 v6 a3,3 0 0 0 6,0 v-6 M -8,-2 v14 M 6,-12 a5,7 0 0 0 0,14 v-14" fill="none" stroke={onColor} strokeWidth="2.2" strokeLinecap="round" />,
    trees: (
      <g fill={onColor}>
        <path d="M -9,4 L -3,-12 L 3,4 Z" /><rect x="-4.5" y="4" width="3" height="6" />
        <path d="M 5,6 L 10,-8 L 15,6 Z" /><rect x="8.5" y="6" width="3" height="6" />
      </g>
    ),
    'no-parking': <TextGlyph text="P" c={onColor} size={20} />,
    'no-parking-odd': <TextGlyph text="1-31" c={onColor} size={13} />,
    'no-parking-even': <TextGlyph text="2-30" c={onColor} size={13} />,
    'no-parking-date': <TextGlyph text="P" c={onColor} size={20} />,
    'purpose-place-end': <TextGlyph text="P" c={onColor} size={20} />,
    'turning-place-end': <ArrowIcon c={onColor} rot={180} double />,
    'parking-angle': <path d="M -10,10 L -2,-10 L 10,10" fill="none" stroke={onColor} strokeWidth="2.6" strokeLinejoin="round" />,
    // road markings (top-down)
    'zebra': (
      <g fill={WHITE}>
        {[-12, -4, 4, 12].map((x) => <rect key={x} x={x - 1.6} y="-14" width="3.2" height="28" />)}
      </g>
    ),
    'bike-crossing-mark': (
      <g fill={WHITE}>
        {[-10, 0, 10].map((x) => <rect key={x} x={x - 2} y="-12" width="4" height="10" />)}
      </g>
    ),
    'bike-box': <rect x="-14" y="-8" width="28" height="16" fill="none" stroke={WHITE} strokeWidth="2.4" strokeDasharray="4 3" />,
    'yield-advance-mark': (
      <g transform="scale(0.7)">
        <polygon points="0,-16 8,10 -8,10" fill="none" stroke={WHITE} strokeWidth="2.6" />
        <polygon points="0,-2 8,10 -8,10" fill="none" stroke={WHITE} strokeWidth="2.6" />
      </g>
    ),
    'stop-line': <rect x="-16" y="-3" width="32" height="6" fill={WHITE} />,
    'yield-line': (
      <g fill={WHITE}>{[-14, -4, 6].map((x) => <rect key={x} x={x} y="-3" width="8" height="6" />)}</g>
    ),
    'no-stop-mark': <TextGlyph text="✕" c={WHITE} size={18} />,
    'no-park-mark': <TextGlyph text="P" c={WHITE} size={18} />,
    'no-stop-park-mark': <TextGlyph text="✕" c={WHITE} size={18} />,
    'parking-spot-mark': <rect x="-12" y="-12" width="24" height="24" fill="none" stroke={WHITE} strokeWidth="2" />,
    // symbols/text-based
    's-symbol': <TextGlyph text="S" c={onColor} size={20} />,
    's-symbol-line': <TextGlyph text="S̶" c={onColor} size={20} />,
    'vertical-line': <line x1="0" y1="-14" x2="0" y2="14" stroke={WHITE} strokeWidth="5" />,
    'horizontal-line': <line x1="-14" y1="0" x2="14" y2="0" stroke={WHITE} strokeWidth="5" />,
    'arrow-yellow': <ArrowIcon c="#ffd400" rot={0} />,
    'arrow-green': <ArrowIcon c="#2ecc71" rot={0} />,
    'sound-red': <TextGlyph text="))" c={RED} size={16} />,
    'sound-green': <TextGlyph text="))" c="#2ecc71" size={16} />,
    'hand-stop': <HandFigure arm="stop" c={onColor} />,
    'hand-forward': <HandFigure arm="forward" c={onColor} />,
    'hand-slow': <HandFigure arm="slow" c={onColor} />,
    'hand-control': <HandFigure arm="control" c={onColor} />,
    'hand-follow': <HandFigure arm="follow" c={onColor} />,
    'hand-pullover': <HandFigure arm="pullover" c={onColor} />,
    'closed': <line x1="-14" y1="14" x2="14" y2="-14" stroke={RED} strokeWidth="5" />,
    'generic': <GenericBox c={onColor} />,
    'none': null,
    'curve-left': <path d="M -12,12 Q -12,-12 12,-12" fill="none" stroke={onColor} strokeWidth="4.5" strokeLinecap="round" />,
    'curve-double': <path d="M -13,12 Q -13,0 0,0 Q 13,0 13,-12" fill="none" stroke={onColor} strokeWidth="4.5" strokeLinecap="round" />,
    'slope-down': <path d="M -14,-8 L 14,10" fill="none" stroke={onColor} strokeWidth="4.5" strokeLinecap="round" />,
    'slope-up': <path d="M -14,10 L 14,-8" fill="none" stroke={onColor} strokeWidth="4.5" strokeLinecap="round" />,
    'narrow-road': <path d="M -14,-13 L -4,13 L 4,13 L 14,-13" fill="none" stroke={onColor} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />,
    'uneven-road': <path d="M -14,8 L -7,-8 L 0,8 L 7,-8 L 14,8" fill="none" stroke={onColor} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />,
    'bump': <path d="M -14,8 Q 0,-14 14,8" fill="none" stroke={onColor} strokeWidth="4" strokeLinecap="round" />,
    'skid': <path d="M -12,-6 Q 0,10 12,-6 M -12,6 Q 0,-10 -1,6" fill="none" stroke={onColor} strokeWidth="3" strokeLinecap="round" />,
    'gravel': <g fill={onColor}>{[[-8,-6],[3,-9],[9,2],[-3,6],[-10,4]].map(([x,y]) => <circle key={x+','+y} cx={x} cy={y} r="3" />)}</g>,
    'rockfall': <path d="M -13,10 L -13,2 L -4,-9 L 5,2 L 5,10 M 9,10 L 9,4 L 13,-1 L 13,10" fill="none" stroke={onColor} strokeWidth="2.6" strokeLinejoin="round" />,
    'pedestrian-crossing': (
      <g>
        <Pedestrian c={onColor} />
        <g fill={onColor} transform="translate(10,10)">
          {[-6, -1, 4].map((x) => <rect key={x} x={x} y="-3" width="3" height="9" />)}
        </g>
      </g>
    ),
    'roadwork': <path d="M -8,10 L -2,-10 M -2,-10 L -8,-10 M -2,-10 L 2,-10 M 6,10 L 6,-4 L 12,2" fill="none" stroke={onColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />,
    'traffic-light': (
      <g>
        <rect x="-6" y="-14" width="12" height="26" rx="2" fill="none" stroke={onColor} strokeWidth="2.4" />
        <circle cx="0" cy="-8" r="2.6" fill={onColor} />
        <circle cx="0" cy="-1" r="2.6" fill="none" stroke={onColor} strokeWidth="1.5" />
        <circle cx="0" cy="6" r="2.6" fill="none" stroke={onColor} strokeWidth="1.5" />
      </g>
    ),
    'crosswind': <path d="M -13,-4 h20 a4,4 0 1 0 -4,-4 M -13,6 h14 a4,4 0 1 1 -4,4" fill="none" stroke={onColor} strokeWidth="2.8" strokeLinecap="round" />,
    'weak-edge': <path d="M -13,10 L 13,10 M -13,10 L -13,-6 L -6,-10" fill="none" stroke={onColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />,
    'slow-vehicle': <path d="M -13,10 L 13,10 L 8,-4 L -2,-4 L -2,10 M -13,10 L -6,-4 L -2,-4" fill="none" stroke={onColor} strokeWidth="2.6" strokeLinejoin="round" />,
    'speed-end': (
      <g>
        <TextGlyph text="50" c={onColor} size={18} />
        <line x1="-16" y1="16" x2="16" y2="-16" stroke="#9aa1ab" strokeWidth="3.5" />
      </g>
    ),
  };

  // خطوط الطريق (M) — تُرسم كخط علوي بدل رمز مركزي
  const lineStyles = {
    'line-center': 'dashed', 'line-edge': 'edge', 'line-warning': 'warning', 'line-guide': 'dashed',
    'line-bike': 'dashed', 'line-transit': 'dashed', 'line-reversible': 'dashed', 'line-solid': 'solid',
    'line-combo': 'double',
  };
  if (lineStyles[glyph]) return g(<LineDiagram style={lineStyles[glyph]} color={WHITE} />);
  if (glyph === 'hatched-area') return g(<g stroke={WHITE} strokeWidth="2">{[-16, -8, 0, 8, 16].map((x) => <line key={x} x1={x} y1="-16" x2={x + 10} y2="16" />)}</g>);

  // إشارات الإضاءة (الدائرة الملونة)
  const dots = {
    'dot-red': ['#e74c3c', false], 'dot-green': ['#2ecc71', false], 'dot-yellow': ['#f1c40f', false],
    'dot-red-yellow': ['#e74c3c', false], 'dot-yellow-blink': ['#f1c40f', true], 'dot-red-blink': ['#e74c3c', true],
  };
  if (dots[glyph]) {
    const [color, blink] = dots[glyph];
    return g(<Dot c={color} blink={blink} />);
  }

  // نهاية سريان علامة (…-end): نرسم الرمز الأساسي مع خط قطري خفيف فوقه
  if (glyph.endsWith('-end') && !simple[glyph]) {
    const base = glyph.slice(0, -4);
    const baseEl = simple[base];
    if (baseEl) {
      return g(
        <>
          {baseEl}
          <line x1="-16" y1="16" x2="16" y2="-16" stroke="#9aa1ab" strokeWidth="3.5" />
        </>
      );
    }
  }

  if (glyph in simple) return g(simple[glyph]);
  return g(<GenericBox c={onColor} />);
}

export default function TrafficSignIcon({ shape, glyph = 'none', size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <ShapeContainer shape={shape}>{glyphContent(glyph, shape)}</ShapeContainer>
    </svg>
  );
}
