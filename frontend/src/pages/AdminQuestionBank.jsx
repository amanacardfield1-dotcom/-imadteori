import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  adminGetGroups, adminGetQuestionsForGroup, adminUpdateQuestion,
  adminUpdateGroupWeight, adminSetGroupActive, clearBankCache,
} from '../practiceExam/api';

function GroupsOverview({ groups, questionCounts, onOpenGroup, onWeightChange, onToggleActive }) {
  const totalWeight = groups.reduce((acc, g) => acc + (g.weight || 0), 0);
  return (
    <>
      <p className="muted">
        إجمالي الأوزان الحالية: {(totalWeight * 100).toFixed(1)}% (يجب أن يقارب 100%). عدد الأسئلة
        الكلي في البنك: {Object.values(questionCounts).reduce((a, b) => a + b, 0)}.
      </p>
      <div className="table-scroll">
        <table className="results-table">
          <thead>
            <tr>
              <th>#</th>
              <th>المجموعة</th>
              <th>عدد الأسئلة</th>
              <th>الوزن</th>
              <th>نشطة؟</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.id}>
                <td>{g.group_number}</td>
                <td>{g.group_name}</td>
                <td>{questionCounts[g.id] || 0}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    style={{ width: 70 }}
                    defaultValue={((g.weight || 0) * 100).toFixed(1)}
                    onBlur={(e) => {
                      const pct = parseFloat(e.target.value);
                      if (!Number.isNaN(pct)) onWeightChange(g.id, pct / 100);
                    }}
                  />%
                </td>
                <td>
                  <input type="checkbox" checked={g.active !== false} onChange={(e) => onToggleActive(g.id, e.target.checked)} />
                </td>
                <td>
                  <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={() => onOpenGroup(g.id)}>
                    عرض الأسئلة
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function QuestionsInGroup({ group, questions, onBack, onSaveQuestion, onToggleStatus }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);

  const startEdit = (q) => {
    setEditingId(q.id);
    setDraft({ question_text: q.question_text, explanation: q.explanation, answers: q.answers.map((a) => ({ ...a })) });
  };

  const saveEdit = async (id) => {
    await onSaveQuestion(id, draft);
    setEditingId(null);
    setDraft(null);
  };

  return (
    <>
      <button className="link-btn" onClick={onBack}>← العودة لقائمة المجموعات</button>
      <h2>{group.group_name}</h2>
      <p className="muted">{group.description}</p>

      <div className="review-list">
        {questions.map((q, idx) => (
          <div key={q.id} className={`review-item ${q.status === 'active' ? '' : 'incorrect'}`}>
            {editingId === q.id ? (
              <>
                <textarea
                  style={{ width: '100%', minHeight: 60 }}
                  value={draft.question_text}
                  onChange={(e) => setDraft((d) => ({ ...d, question_text: e.target.value }))}
                />
                {draft.answers.map((a, i) => (
                  <div key={a.id} className="quiz-option">
                    <input type="radio" checked={a.correct} onChange={() => setDraft((d) => ({ ...d, answers: d.answers.map((x, xi) => ({ ...x, correct: xi === i })) }))} />
                    <input
                      style={{ flex: 1 }}
                      value={a.text}
                      onChange={(e) => setDraft((d) => ({ ...d, answers: d.answers.map((x, xi) => (xi === i ? { ...x, text: e.target.value } : x)) }))}
                    />
                  </div>
                ))}
                <textarea
                  style={{ width: '100%', minHeight: 40, marginTop: 8 }}
                  value={draft.explanation}
                  onChange={(e) => setDraft((d) => ({ ...d, explanation: e.target.value }))}
                />
                <div className="admin-actions" style={{ marginTop: 8 }}>
                  <button className="btn-primary" onClick={() => saveEdit(q.id)}>حفظ</button>
                  <button className="btn-secondary" onClick={() => setEditingId(null)}>إلغاء</button>
                </div>
              </>
            ) : (
              <>
                <p className="review-question">{idx + 1}. {q.question_text}</p>
                <ul>
                  {q.answers.map((a) => (
                    <li key={a.id} className={a.correct ? 'success' : ''}>{a.id}. {a.text}</li>
                  ))}
                </ul>
                <p className="explanation">💡 {q.explanation}</p>
                <p className="muted tp-mono">
                  الصعوبة: {q.difficulty} | ظهرت: {q.times_shown || 0} | أُجيبت: {q.times_answered || 0} |
                  {' '}صحيحة: {q.times_correct || 0} | خاطئة: {q.times_wrong || 0} |
                  {' '}نسبة الإجابة الصحيحة: {q.times_answered ? Math.round(((q.times_correct || 0) / q.times_answered) * 100) : '—'}%
                  {' '}| الحالة: {q.status === 'active' ? 'نشط' : (q.status === 'disabled' ? 'معطَّل' : 'يحتاج مراجعة')}
                </p>
                <div className="admin-actions">
                  <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={() => startEdit(q)}>تعديل</button>
                  {q.status === 'active' ? (
                    <button className="btn-danger" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={() => onToggleStatus(q.id, 'disabled')}>تعطيل</button>
                  ) : (
                    <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={() => onToggleStatus(q.id, 'active')}>إعادة تفعيل</button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default function AdminQuestionBank() {
  const [groups, setGroups] = useState([]);
  const [questionCounts, setQuestionCounts] = useState({});
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groupQuestions, setGroupQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGroup, setLoadingGroup] = useState(false);

  useEffect(() => {
    adminGetGroups().then(async (gs) => {
      setGroups(gs);
      const counts = {};
      gs.forEach((g) => { counts[g.id] = g.question_count || 0; });
      setQuestionCounts(counts);
      setLoading(false);
    });
  }, []);

  const selectedGroup = useMemo(() => groups.find((g) => g.id === selectedGroupId), [groups, selectedGroupId]);

  const openGroup = async (groupId) => {
    setSelectedGroupId(groupId);
    setLoadingGroup(true);
    const qs = await adminGetQuestionsForGroup(groupId);
    setGroupQuestions(qs.sort((a, b) => a.question_id?.localeCompare(b.question_id)));
    setLoadingGroup(false);
  };

  const handleWeightChange = async (groupId, weight) => {
    setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, weight } : g)));
    await adminUpdateGroupWeight(groupId, weight);
  };

  const handleToggleActive = async (groupId, active) => {
    setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, active } : g)));
    await adminSetGroupActive(groupId, active);
  };

  const handleSaveQuestion = async (questionId, draft) => {
    await adminUpdateQuestion(questionId, draft);
    setGroupQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, ...draft } : q)));
  };

  const handleToggleStatus = async (questionId, status) => {
    await adminUpdateQuestion(questionId, { status });
    setGroupQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, status } : q)));
  };

  return (
    <div className="page">
      <div className="admin-subnav">
        <Link to="/admin">طلبات التسجيل</Link>
        <Link to="/admin/exam-results">نتائج الاختبارات</Link>
        <Link to="/admin/question-bank" className="active">بنك الأسئلة الجديد</Link>
      </div>

      <h1>بنك الأسئلة الجديد</h1>
      <p className="muted">
        عرض إداري للمجموعات المعرفية الـ26 وأوزان الاختيار وعدد الأسئلة النشطة في كل مجموعة.
      </p>

      {loading && <p>جارِ التحميل...</p>}

      {!loading && !selectedGroup && (
        <GroupsOverview
          groups={groups}
          questionCounts={questionCounts}
          onOpenGroup={openGroup}
          onWeightChange={handleWeightChange}
          onToggleActive={handleToggleActive}
        />
      )}

      {!loading && selectedGroup && (
        loadingGroup ? <p>جارِ التحميل...</p> : (
          <QuestionsInGroup
            group={selectedGroup}
            questions={groupQuestions}
            onBack={() => { setSelectedGroupId(null); clearBankCache(); }}
            onSaveQuestion={handleSaveQuestion}
            onToggleStatus={handleToggleStatus}
          />
        )
      )}
    </div>
  );
}
