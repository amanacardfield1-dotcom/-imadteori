const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const { EDITION, questions } = require('../data/originalQuestionBank');
const { renderScene, W, H } = require('../data/questionSceneRenderer');

async function main() {
  const root = path.resolve(__dirname, '../../frontend/public/question-scenes');
  await fs.mkdir(root, { recursive: true });
  const entries = [];
  for (const q of questions.filter((question) => question.visual)) {
    const svg = renderScene(q.visual);
    const bytes = await sharp(Buffer.from(svg)).png().toBuffer();
    const filename = `${q.id}.png`;
    await fs.writeFile(path.join(root, filename), bytes);
    entries.push({ questionId: q.id, filename, width: W, height: H, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), authorship: 'project-original-diagram', visualStatus: q.review.visualStatus });
  }
  await fs.writeFile(path.resolve(__dirname, '../data/questionScenesManifest.json'), `${JSON.stringify({ edition: EDITION, entries }, null, 2)}\n`);
  console.log(`Rendered ${entries.length} original PNG diagrams.`);
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
