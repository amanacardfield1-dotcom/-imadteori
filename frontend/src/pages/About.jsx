import { trainer } from '../trainer';

export default function About() {
  return (
    <div className="page about-page">
      <div className="trainer-card">
        <img src={trainer.photo} alt={trainer.displayName} className="trainer-photo" />
        <div>
          <h1>{trainer.displayName}</h1>
          <p className="trainer-handle">{trainer.handle}</p>
          <p className="trainer-bio">{trainer.bio}</p>
          <div className="trainer-stats">
            <span>👥 {trainer.stats.followers} متابع</span>
            <span>❤️ {trainer.stats.likes} إعجاب</span>
          </div>
          <a href={trainer.tiktokUrl} target="_blank" rel="noreferrer" className="btn-primary">
            تابعنا على تيك توك
          </a>
        </div>
      </div>

      <section className="about-extra">
        <h2>لماذا هذا الموقع؟</h2>
        <p>
          هذا الموقع مرجع مجاني للمتدربين الذين يحضرون بثوث عماد المباشرة على تيك توك، ليتمكنوا من
          مراجعة الأسئلة بأنفسهم بعد كل بث، وتتبع مستواهم قبل التوجه لاختبار التيوري الحقيقي.
        </p>
      </section>
    </div>
  );
}
