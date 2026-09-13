import { signCategories } from '../signsData';
import SignIcon from '../components/SignIcon';

export default function TrafficSigns() {
  return (
    <div className="page">
      <h1>الشاخصات المرورية في السويد</h1>
      <p className="muted">
        مرجع سريع لفئات إشارات المرور السويدية الرئيسية وأشكالها القياسية، ليساعدك على تمييز
        نوع الإشارة من شكلها ولونها حتى قبل قراءة تفاصيلها.
      </p>

      <div className="signs-list">
        {signCategories.map((cat) => (
          <div key={cat.id} className="sign-category">
            <div className="sign-category-header">
              <SignIcon shape={cat.shape} />
              <div>
                <h3>{cat.title}</h3>
                <p className="muted">{cat.subtitle}</p>
              </div>
            </div>
            <ul>
              {cat.examples.map((ex, i) => (
                <li key={i}>{ex}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
