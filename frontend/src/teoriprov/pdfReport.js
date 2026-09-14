import { CATEGORY_LABELS } from './engine';

// نستخدم html2canvas لتصيير التقرير كـ HTML عربي طبيعي (لأن jsPDF وحده لا يدعم
// تشكيل الحروف العربية بشكل صحيح)، ثم نحوّل كل قسم إلى صفحة PDF منفصلة.
// نقسّم المحتوى على عدة صور/صفحات بدل صورة واحدة طويلة جدًا لتفادي حدود
// حجم الـ canvas القصوى في بعض المتصفحات مع تقارير الأسئلة الطويلة (70 سؤالًا).
const QUESTIONS_PER_CHUNK = 12;

export async function generateAttemptPdf(attempt) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();

  const sections = [buildSummarySection(attempt), ...buildQuestionSections(attempt)];

  for (let i = 0; i < sections.length; i++) {
    const container = sections[i];
    document.body.appendChild(container);
    try {
      const canvas = await html2canvas(container, { scale: 1.5, useCORS: true, backgroundColor: '#ffffff' });
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      if (i > 0) pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pageWidth, imgHeight);
    } finally {
      document.body.removeChild(container);
    }
  }

  const dateStr = new Date(attempt.takenAt).toISOString().slice(0, 10);
  pdf.save(`teoriprov-${attempt.userName || attempt.userId}-${dateStr}.pdf`);
}

function esc(s) {
  const div = document.createElement('div');
  div.textContent = s ?? '';
  return div.innerHTML;
}

function baseContainer() {
  const wrap = document.createElement('div');
  wrap.style.position = 'fixed';
  wrap.style.left = '-99999px';
  wrap.style.top = '0';
  wrap.style.width = '780px';
  wrap.style.direction = 'rtl';
  wrap.style.fontFamily = "'Tajawal', 'Segoe UI', sans-serif";
  wrap.style.background = '#ffffff';
  wrap.style.color = '#1b1f27';
  wrap.style.padding = '32px';
  return wrap;
}

function buildSummarySection(a) {
  const wrap = baseContainer();

  const start = new Date(a.startedAt);
  const end = new Date(a.takenAt);
  const usedMin = Math.floor(a.durationUsedSeconds / 60);
  const usedSec = String(a.durationUsedSeconds % 60).padStart(2, '0');
  const avgPerQ = a.questions.length ? Math.round(a.durationUsedSeconds / a.questions.length) : 0;

  const catRows = Object.entries(a.categoryScores)
    .map(([cat, s]) => {
      const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
      return `<tr><td style="padding:6px 10px;border:1px solid #e5e7eb;">${esc(CATEGORY_LABELS[cat] || cat)}</td><td style="padding:6px 10px;border:1px solid #e5e7eb;">${s.correct}/${s.total}</td><td style="padding:6px 10px;border:1px solid #e5e7eb;">${pct}%</td></tr>`;
    })
    .join('');

  const weak = Object.entries(a.categoryScores)
    .map(([cat, s]) => ({ cat, pct: s.total ? (s.correct / s.total) * 100 : 0 }))
    .sort((x, y) => x.pct - y.pct)
    .slice(0, 2)
    .map((c) => CATEGORY_LABELS[c.cat] || c.cat)
    .join('، ');

  wrap.innerHTML = `
    <div style="text-align:center;margin-bottom:20px;border-bottom:3px solid #0a3d91;padding-bottom:12px;">
      <div style="font-size:22px;font-weight:800;color:#0a3d91;">🇸🇪 أكاديمية عماد للتيوري السويدي</div>
      <div style="font-size:16px;color:#6b7280;margin-top:4px;">تقرير نتيجة محاكاة اختبار Teoriprov</div>
    </div>

    <h3 style="color:#0a3d91;">معلومات المتدرب</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:14px;">
      <tr><td style="padding:4px 10px;font-weight:700;">الاسم</td><td style="padding:4px 10px;">${esc(a.userName || '—')}</td></tr>
      <tr><td style="padding:4px 10px;font-weight:700;">البريد الإلكتروني / المعرّف</td><td style="padding:4px 10px;">${esc(a.userEmail || a.userId)}</td></tr>
      <tr><td style="padding:4px 10px;font-weight:700;">تاريخ ووقت بدء الاختبار</td><td style="padding:4px 10px;">${start.toLocaleString('ar-EG')}</td></tr>
      <tr><td style="padding:4px 10px;font-weight:700;">تاريخ ووقت انتهاء الاختبار</td><td style="padding:4px 10px;">${end.toLocaleString('ar-EG')}</td></tr>
    </table>

    <h3 style="color:#0a3d91;">ملخص النتيجة</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;font-size:14px;">
      <tr><td style="padding:4px 10px;font-weight:700;">مدة الاختبار المحددة</td><td style="padding:4px 10px;">50:00</td></tr>
      <tr><td style="padding:4px 10px;font-weight:700;">الوقت الفعلي المستغرق</td><td style="padding:4px 10px;">${usedMin}:${usedSec}</td></tr>
      <tr><td style="padding:4px 10px;font-weight:700;">عدد الأسئلة الكلي</td><td style="padding:4px 10px;">${a.questions.length}</td></tr>
      <tr><td style="padding:4px 10px;font-weight:700;">الإجابات الصحيحة</td><td style="padding:4px 10px;">${a.score}</td></tr>
      <tr><td style="padding:4px 10px;font-weight:700;">الإجابات الخاطئة</td><td style="padding:4px 10px;">${a.incorrectCount ?? '—'}</td></tr>
      <tr><td style="padding:4px 10px;font-weight:700;">بدون إجابة</td><td style="padding:4px 10px;">${a.unansweredCount ?? '—'}</td></tr>
      <tr><td style="padding:4px 10px;font-weight:700;">العلامة النهائية</td><td style="padding:4px 10px;font-weight:800;">${a.score} / ${a.totalScored}</td></tr>
      <tr><td style="padding:4px 10px;font-weight:700;">النسبة المئوية</td><td style="padding:4px 10px;">${a.percentage}%</td></tr>
      <tr><td style="padding:4px 10px;font-weight:700;">الحالة</td><td style="padding:4px 10px;font-weight:800;color:${a.passed ? '#1e8449' : '#c0392b'};">${a.passed ? 'ناجح' : 'غير ناجح'}</td></tr>
    </table>

    <h3 style="color:#0a3d91;">ملخص الأداء حسب المجال</h3>
    <table style="width:100%;border-collapse:collapse;margin-bottom:8px;font-size:14px;">
      <tr style="background:#0a3d91;color:white;"><th style="padding:6px 10px;border:1px solid #e5e7eb;">المجال</th><th style="padding:6px 10px;border:1px solid #e5e7eb;">النتيجة</th><th style="padding:6px 10px;border:1px solid #e5e7eb;">النسبة</th></tr>
      ${catRows}
    </table>
    <p style="font-size:13px;color:#6b7280;">متوسط الوقت لكل سؤال: ~${avgPerQ} ثانية.</p>
    ${weak ? `<p style="background:#fff8e1;border-radius:8px;padding:10px 14px;font-size:14px;">💡 التوصية: مراجعة موضوعات <strong>${esc(weak)}</strong> قبل إعادة الاختبار.</p>` : ''}
  `;

  return wrap;
}

function buildQuestionSections(a) {
  const chunks = [];
  for (let i = 0; i < a.questions.length; i += QUESTIONS_PER_CHUNK) {
    chunks.push(a.questions.slice(i, i + QUESTIONS_PER_CHUNK).map((q, j) => ({ q, num: i + j + 1 })));
  }

  return chunks.map((chunk, chunkIdx) => {
    const wrap = baseContainer();
    const items = chunk
      .map(({ q, num }) => {
        const statusLabel = q.isTrial
          ? '<span style="color:#6b7280;">سؤال تجريبي (غير محتسب)</span>'
          : q.selectedIndex === null
          ? '<span style="color:#b8860b;">⬤ لم تتم الإجابة</span>'
          : q.isCorrect
          ? '<span style="color:#1e8449;">✓ إجابة صحيحة</span>'
          : '<span style="color:#c0392b;">✗ إجابة خاطئة</span>';

        const userAnswer = q.selectedIndex !== null ? esc(q.options[q.selectedIndex]) : 'لم تتم الإجابة';
        const correctLine =
          !q.isTrial && !q.isCorrect
            ? `<div style="color:#1e8449;">الإجابة الصحيحة: ${esc(q.options[q.correctIndex])}</div>`
            : '';
        const imgHtml = q.imageUrl ? `<img src="${esc(q.imageUrl)}" style="max-width:100%;margin:6px 0;border-radius:6px;" />` : '';

        return `
          <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px 14px;margin-bottom:10px;">
            <div style="font-weight:700;margin-bottom:4px;">${num}. ${esc(q.text)}</div>
            <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">المجال: ${esc(CATEGORY_LABELS[q.category] || q.category)}</div>
            ${imgHtml}
            <div>إجابة المستخدم: ${userAnswer}</div>
            ${correctLine}
            <div style="margin-top:4px;">الحالة: ${statusLabel}</div>
          </div>`;
      })
      .join('');

    wrap.innerHTML = `
      <h3 style="color:#0a3d91;">تفاصيل الأسئلة (${chunkIdx * QUESTIONS_PER_CHUNK + 1}–${chunkIdx * QUESTIONS_PER_CHUNK + chunk.length})</h3>
      ${items}
    `;
    return wrap;
  });
}
