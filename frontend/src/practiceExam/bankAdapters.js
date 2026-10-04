export function isQuestionIncluded(row, settings = {}) {
  if (row.status !== 'active') return false;
  if (!row.edition) return true;
  const editions = new Set([...(settings.included_editions || []), settings.active_edition].filter(Boolean));
  return editions.has(row.edition) && row.review?.status === 'source_checked'
    && (!row.image_url || row.review?.visualStatus === 'checked');
}

export function mergeCategoryBanks(existing, additions) {
  const result = {};
  const ids = new Set();
  for (const category of ['regler', 'sakerhet', 'fordon', 'miljo', 'personliga']) {
    result[category] = [...(existing[category] || []), ...(additions[category] || [])].filter((q) => {
      if (ids.has(q.id)) return false;
      ids.add(q.id);
      return true;
    });
  }
  return result;
}

export function toExamQuestion(row, group = {}) {
  const correct = row.answers?.filter((answer) => answer.correct);
  if (row.status !== 'active' || correct?.length !== 1 || row.answers?.length !== 4) return null;
  if (row.edition && (row.review?.status !== 'source_checked' || (row.image_url && row.review?.visualStatus !== 'checked'))) return null;
  return {
    id: row.question_id, edition: row.edition || null,
    category: row.legacy_category || group.legacy_category,
    groupId: row.group_id, groupName: group.group_name || '',
    conceptTopic: row.concept_topic, difficulty: row.difficulty,
    scenario: row.scenario_type === 'scenario', text: row.question_text,
    options: row.answers.map((a) => a.text), correctIndex: row.answers.findIndex((a) => a.correct),
    explanation: row.explanation, imageUrl: row.image_url || null, imageAlt: row.image_alt || '',
  };
}

export function originalImageQuestions(bank) {
  return bank.groups.filter((g) => g.active !== false).flatMap((group) => (
    (bank.byGroup[group.id] || []).map((row) => toExamQuestion(row, group)).filter((q) => q?.imageUrl)
  ));
}

export function toCategoryBank(bank, { editionsOnly = false } = {}) {
  const result = { regler: [], sakerhet: [], fordon: [], miljo: [], personliga: [] };
  for (const group of bank.groups.filter((g) => g.active !== false)) {
    for (const row of bank.byGroup[group.id] || []) {
      if (editionsOnly && !row.edition) continue;
      const q = toExamQuestion(row, group);
      if (q && result[q.category]) result[q.category].push(q);
    }
  }
  return result;
}
