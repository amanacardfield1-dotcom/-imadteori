import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="page">
      <section className="hero">
        <h1>مرجعك الكامل لاجتياز اختبار التيوري في السويد ✅</h1>
        <p>
          منصة مجانية مخصصة لمتدربي عماد الذين يحضرون البثوث المباشرة على تيك توك، لمراجعة
          الأسئلة بأنفسهم في أي وقت وتتبّع تقدمهم خطوة بخطوة.
        </p>
        <div className="hero-actions">
          <Link to="/tests" className="btn-primary">
            ابدأ اختبارًا تجريبيًا الآن
          </Link>
          <Link to="/about" className="btn-secondary">
            تعرّف على المدرب
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>📝 اختبارات تدريبية</h3>
          <p>أسئلة متجددة مبنية على القواعد الرسمية لقيادة السيارات في السويد.</p>
        </div>
        <div className="feature-card">
          <h3>📊 تتبّع تقدمك</h3>
          <p>أنشئ حسابًا مجانيًا واحفظ نتائجك لمعرفة نقاط قوتك وما يحتاج مراجعة أكثر.</p>
        </div>
        <div className="feature-card">
          <h3>🔴 مكمّل للبثوث المباشرة</h3>
          <p>راجع بعد كل بث مباشر على تيك توك بنفس الأسلوب المبسط الذي اعتدت عليه.</p>
        </div>
      </section>
    </div>
  );
}
