import TrafficSignIcon from './TrafficSignIcon';

export default function TrafficSignVisual({ sign, size = 64, className = '' }) {
  const style = { '--traffic-sign-size': `${size}px` };

  if (sign?.image) {
    return (
      <img
        className={`traffic-sign-image ${className}`.trim()}
        src={sign.image}
        alt={sign.imageAlt || sign.arabicName || sign.code}
        loading="lazy"
        decoding="async"
        style={style}
      />
    );
  }

  return (
    <span className={`traffic-sign-fallback ${className}`.trim()} style={style}>
      <TrafficSignIcon shape={sign.shape} glyph={sign.glyph} size={size} />
    </span>
  );
}
