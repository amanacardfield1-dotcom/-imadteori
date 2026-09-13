// أيقونات مبسطة مرسومة بـ SVG لتمثيل الشكل واللون القياسي لكل فئة إشارات،
// وليست نسخًا لأي إشارة رسمية بعينها.
export default function SignIcon({ shape, size = 56 }) {
  const common = { width: size, height: size, viewBox: '0 0 64 64' };

  switch (shape) {
    case 'triangle':
      return (
        <svg {...common}>
          <polygon points="32,6 60,56 4,56" fill="#fff" stroke="#c0392b" strokeWidth="5" />
          <text x="32" y="46" fontSize="26" textAnchor="middle" fill="#c0392b">!</text>
        </svg>
      );
    case 'circle-red':
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="26" fill="#fff" stroke="#c0392b" strokeWidth="6" />
          <line x1="14" y1="50" x2="50" y2="14" stroke="#c0392b" strokeWidth="6" />
        </svg>
      );
    case 'circle-blue':
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="28" fill="#0a3d91" />
          <polygon points="32,16 40,44 24,44" fill="#fff" />
        </svg>
      );
    case 'priority':
      return (
        <svg {...common}>
          <rect x="14" y="14" width="36" height="36" fill="#ffd400" stroke="#fff" strokeWidth="3" transform="rotate(45 32 32)" />
        </svg>
      );
    case 'square-blue':
      return (
        <svg {...common}>
          <rect x="8" y="8" width="48" height="48" rx="6" fill="#0a3d91" />
          <rect x="18" y="18" width="28" height="28" rx="3" fill="#fff" />
        </svg>
      );
    case 'lines':
      return (
        <svg {...common}>
          <rect width="64" height="64" fill="#374151" rx="6" />
          <line x1="32" y1="6" x2="32" y2="58" stroke="#fff" strokeWidth="5" strokeDasharray="8 6" />
        </svg>
      );
    default:
      return null;
  }
}
