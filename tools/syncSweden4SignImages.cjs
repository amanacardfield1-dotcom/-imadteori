const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'frontend', 'src', 'trafficSignsData.js');
const OUT_DIR = path.join(ROOT, 'frontend', 'public', 'traffic-signs', 'sweden4');
const INDEX_URL = 'https://sweden4.com/?p=70940';

function decodeHtml(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '-')
    .replace(/&#8230;/g, '...')
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)));
}

function absoluteUrl(href) {
  if (!href) return null;
  if (href.startsWith('http')) return href;
  if (href.startsWith('//')) return `https:${href}`;
  return new URL(href, INDEX_URL).toString();
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 Codex migration' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function download(url, file) {
  if (fs.existsSync(file)) return fs.statSync(file).size;
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 Codex migration' } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buf);
  return buf.length;
}

function parseAnchors(html) {
  const anchors = [];
  const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = re.exec(html))) {
    const href = absoluteUrl(decodeHtml(match[1]));
    const text = decodeHtml(match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
    anchors.push({ href, text });
  }
  return anchors;
}

function parseImages(html) {
  const images = [];
  const rawImageCount = (html.match(/<img\b/gi) || []).length;
  const re = /<img\b([^>]+)>/gi;
  let match;
  while ((match = re.exec(html))) {
    const attrs = match[1];
    const src =
      attrs.match(/(?:^|\s)(?:src|data-src)\s*=\s*["']([^"']+)["']/i)?.[1] ||
      attrs.match(/(?:^|\s)srcset\s*=\s*["']([^"'\s,]+)/i)?.[1];
    const alt = attrs.match(/(?:^|\s)alt\s*=\s*["']([^"']*)["']/i)?.[1] || '';
    const width = Number(attrs.match(/(?:^|\s)width\s*=\s*["']?(\d+)/i)?.[1] || 0);
    const height = Number(attrs.match(/(?:^|\s)height\s*=\s*["']?(\d+)/i)?.[1] || 0);
    const url = absoluteUrl(decodeHtml(src));
    if (!url || !url.includes('/wp-content/uploads/')) continue;
    const basename = path.basename(new URL(url).pathname);
    if (/40x90|logo|avatar|banner|ads|veckans|offer/i.test(basename)) continue;
    if (width > 0 && height > 0 && width <= 90 && height <= 45) continue;
    images.push({ url, alt: decodeHtml(alt), width, height });
  }
  images.rawImageCount = rawImageCount;
  return images;
}

function cleanImageStem(url) {
  return path
    .basename(new URL(url).pathname)
    .replace(/\.[^.]+$/, '')
    .replace(/-\d+x\d+$/i, '');
}

function findCodeForImage(url, codes) {
  const stem = cleanImageStem(url);
  return codes
    .slice()
    .sort((a, b) => b.length - a.length)
    .find((code) => new RegExp(`^${code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|[-_])`, 'i').test(stem));
}

function codesForCategories(signs, categories) {
  return signs
    .filter((sign) => categories.includes(sign.category))
    .map((sign) => sign.code);
}

function loadTrafficSigns() {
  const source = fs.readFileSync(DATA_FILE, 'utf8');
  const json = source
    .replace(/^[\s\S]*?export const trafficSigns = /, '')
    .replace(/;\s*$/, '');
  return JSON.parse(json);
}

function serializeTrafficSigns(signs) {
  return `// ملف مُولَّد: مرجع شامل لكل الشاخصات المرورية السويدية الرسمية (${signs.length} رمزًا)
// المصدر: Sweden4.com (?p=70940) كفهرس حصري لقسم الشاخصات، مع صور مستحضرة من الصفحات التي يربط إليها.
// كل حقل 'officialMeaning' وصف عربي تعليمي لمعنى الشاخصة.
// حقل 'trainingNote' (عند وجوده فقط) شرح تعليمي إضافي لفارق أو قاعدة قد تُخلط بغيرها.
export const trafficSigns = ${JSON.stringify(signs, null, 2)};
`;
}

const SECTION_MAP = [
  { text: 'شاخصات التحذير', categories: ['A'] },
  { text: 'شاخصات الأولوية', categories: ['B'] },
  { text: 'شاخصات المنع', categories: ['C'] },
  { text: 'شاخصات الإلزام', categories: ['D'] },
  { text: 'شاخصات الإرشادية', categories: ['E'] },
  { text: 'شاخصات التوجيه للطرق', categories: ['F'] },
  { text: 'شاخصات لمراكز المهمة', categories: ['G', 'H', 'I'] },
  { text: 'العلامات الأرضية', categories: ['M'] },
  { text: 'الإشارات الضوئية', categories: ['SIG'] },
  { text: 'إشارات البوليس', categories: ['P'] },
  { text: 'تجهيزات للإرشاد على الطرق', categories: ['X'] },
  { text: 'شاخصات ملحقة إضافية', categories: ['T'] },
];

async function discoverSections() {
  const html = await fetchText(INDEX_URL);
  const anchors = parseAnchors(html);
  return SECTION_MAP.map((section) => {
    const found = anchors.find((a) => a.text.includes(section.text));
    return { ...section, url: found?.href };
  }).filter((section) => section.url);
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const signs = loadTrafficSigns();
  const signByCode = new Map(signs.map((sign) => [sign.code, sign]));
  const sections = await discoverSections();
  const report = {
    indexUrl: INDEX_URL,
    sections: sections.map((s) => ({ text: s.text, url: s.url, categories: s.categories })),
    matched: 0,
    missing: [],
    failedDownloads: [],
    extraImages: 0,
  };

  for (const section of sections) {
    const html = await fetchText(section.url);
    const images = parseImages(html);
    const codes = codesForCategories(signs, section.categories);
    report.sections.find((item) => item.url === section.url).rawImageCount = images.rawImageCount;
    report.sections.find((item) => item.url === section.url).imageCount = images.length;
    report.sections.find((item) => item.url === section.url).signCount = codes.length;
    const imagesByCode = new Map();

    images.forEach((image) => {
      const code = findCodeForImage(image.url, codes);
      if (!code) {
        report.extraImages += 1;
        return;
      }
      if (!imagesByCode.has(code)) imagesByCode.set(code, []);
      imagesByCode.get(code).push(image);
    });

    for (const code of codes) {
      const sign = signByCode.get(code);
      const codeImages = imagesByCode.get(code) || [];
      if (sign) {
        sign.source = `Sweden4.com (${section.url})`;
        sign.sourceUrl = section.url;
      }
      if (!sign || codeImages.length === 0) {
        report.missing.push({ code, section: section.text });
        continue;
      }

      let selected = null;
      for (const image of codeImages) {
        const ext = path.extname(new URL(image.url).pathname).split('?')[0] || '.jpg';
        const filename = `${code.toLowerCase()}${ext}`;
        try {
          if (!dryRun) await download(image.url, path.join(OUT_DIR, filename));
          selected = { image, filename };
          break;
        } catch (error) {
          report.failedDownloads.push({ code, section: section.text, image: image.url, error: error.message });
        }
      }

      if (!selected) {
        report.missing.push({ code, section: section.text });
        continue;
      }

      sign.image = `/traffic-signs/sweden4/${selected.filename}`;
      sign.imageSource = selected.image.url;
      sign.imageAlt = selected.image.alt || sign.arabicName;
      report.matched += 1;
    }
  }

  console.log(JSON.stringify(report, null, 2));
  if (!dryRun) fs.writeFileSync(DATA_FILE, serializeTrafficSigns(signs));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
