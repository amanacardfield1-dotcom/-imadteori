import { useAuth } from '../context/AuthContext';

export default function Pending() {
  const { user } = useAuth();
  const rejected = user?.status === 'rejected';

  return (
    <div className="page auth-page">
      <h1>{rejected ? 'تم رفض طلب التسجيل' : 'حسابك بانتظار الموافقة'}</h1>
      <p>
        {rejected
          ? 'للأسف لم تتم الموافقة على طلب تسجيلك في المنصة. يمكنك التواصل مع عماد مباشرة عبر تيك توك للاستفسار.'
          : 'تم استلام طلب تسجيلك بنجاح. سيقوم عماد بمراجعة الطلب والموافقة عليه شخصيًا، وبعدها ستتمكن من الدخول إلى الاختبارات وتتبّع تقدّمك.'}
      </p>
    </div>
  );
}
