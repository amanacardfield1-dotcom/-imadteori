import { useMemo } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import TrafficSignIcon from '../../components/TrafficSignIcon';
import { CATEGORY_CHIPS, getGroup, getGroupSigns } from './data';

function VariantChip({ variant }) {
  if (!variant.resolved) {
    return (
      <span className="sign-variant-chip sign-variant-pending" title={variant.note || 'قيد المراجعة'}>
        <span className="sign-variant-pending-icon">؟</span>
        <span className="sign-variant-label">{variant.label}</span>
      </span>
    );
  }
  return (
    <span className="sign-variant-chip">
      <TrafficSignIcon shape={variant.shape} glyph={variant.glyph} size={40} mirror={!!variant.mirror} rotate={variant.rotate || 0} />
      <span className="sign-variant-label">{variant.label}</span>
    </span>
  );
}

export default function TrafficSignDetail() {
  const { groupId, code } = useParams();
  const navigate = useNavigate();
  const group = getGroup(groupId);
  const signs = useMemo(() => (group ? getGroupSigns(group) : []), [group]);
  const index = signs.findIndex((s) => s.code === code);
  const sign = index >= 0 ? signs[index] : null;

  if (!group || !sign) return <Navigate to={group ? `/traffic-signs/${groupId}` : '/traffic-signs'} replace />;

  const prev = index > 0 ? signs[index - 1] : null;
  const next = index < signs.length - 1 ? signs[index + 1] : null;
  const resolvedVariants = (sign.variants || []).filter((v) => v.resolved);
  const pendingVariants = (sign.variants || []).filter((v) => !v.resolved);

  return (
    <div className="sign-detail-page">
      <Link to={`/traffic-signs/${groupId}`} className="signs-back-link">→ العودة إلى {group.label}</Link>

      <div className="sign-detail-header">
        <div className="sign-detail-visual">
          <TrafficSignIcon shape={sign.shape} glyph={sign.glyph} size={140} />
        </div>
        <div>
          <div className="sign-modal-code">{sign.code}</div>
          <div className="sign-modal-sv">{sign.swedishName}</div>
          <h1 className="sign-detail-ar">{sign.arabicName}</h1>
          <div className="muted">{CATEGORY_CHIPS[sign.category] || sign.category} · {sign.categoryNameAr}</div>
        </div>
      </div>

      <div className="sign-modal-section">
        <h4>المعنى الرسمي</h4>
        <p>{sign.officialMeaning}</p>
      </div>

      {sign.trainingNote && (
        <div className="sign-modal-section sign-modal-training">
          <h4>ملاحظة تعليمية / نصيحة للسائق</h4>
          <p>{sign.trainingNote}</p>
        </div>
      )}

      {(resolvedVariants.length > 0 || pendingVariants.length > 0) && (
        <div className="sign-modal-section">
          <h4>المتغيرات (Variants)</h4>
          <div className="sign-variant-list">
            {resolvedVariants.map((v) => <VariantChip key={v.id} variant={v} />)}
            {pendingVariants.map((v) => <VariantChip key={v.id} variant={v} />)}
          </div>
          {pendingVariants.length > 0 && (
            <p className="muted sign-variant-footnote">توجد متغيرات إضافية قيد المراجعة.</p>
          )}
        </div>
      )}

      <div className="sign-detail-nav">
        <button className="sign-detail-nav-btn" disabled={!prev} onClick={() => prev && navigate(`/traffic-signs/${groupId}/${prev.code}`)}>
          {prev ? `السابق: ${prev.code}` : 'لا يوجد سابق'}
        </button>
        <Link to={`/traffic-signs/${groupId}`} className="sign-detail-nav-back">كل شاخصات {group.label}</Link>
        <button className="sign-detail-nav-btn" disabled={!next} onClick={() => next && navigate(`/traffic-signs/${groupId}/${next.code}`)}>
          {next ? `التالي: ${next.code}` : 'لا يوجد تالي'}
        </button>
      </div>
    </div>
  );
}
