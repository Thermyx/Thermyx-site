// The app's Learn articles, word for word: learn/learning-articles.json and learn/photo-credits.json
// are copies of ThermyxApp/Resources/Content/ in the app repo, and public/learn/ holds its photos
// (Assets.xcassets/Photos). To update, copy those files over again; nothing here is edited by hand.
import credits from "./learn/photo-credits.json";
import learn from "./learn/learning-articles.json";

// Section labels and tones, as the app's LearningArticle.Section has them.
export const LEARN_SECTIONS = {
  heat: { label: "Heat", tone: "ember" },
  feet: { label: "Feet", tone: "amber" },
  recovery: { label: "Recovery", tone: "ice" },
  cold: { label: "Cold", tone: "signal" },
  data: { label: "Your data", tone: "muted" },
};

// Read time worked out from the words at 200 a minute, as the app does (LearningArticle.readMinutes).
function readMinutes(blocks) {
  const words = blocks.reduce(
    (total, { text, title, figure, items = [] }) =>
      total + [text, title, figure, ...items].filter(Boolean).reduce((n, s) => n + s.split(/\s+/).filter(Boolean).length, 0),
    0,
  );
  return Math.max(1, Math.ceil(words / 200));
}

export const ARTICLES = learn.articles.map((article) => ({
  ...article,
  section: LEARN_SECTIONS[article.section] ?? { label: article.section, tone: "muted" },
  photo: {
    src: `/learn/${article.image.asset}.jpg`,
    alt: article.image.alt,
    caption: article.image.caption,
    credit: credits.photos.find((p) => p.asset === article.image.asset) ?? null,
  },
  minutes: readMinutes(article.blocks),
}));

export const articleById = (id) => ARTICLES.find((a) => a.id === id) ?? null;

// Every reference the articles cite, once each, with the articles that cite it. An APA 7 entry is
// split into its authors, year, title, and the rest (venue, volume, pages) for display; `*…*` marks
// italics, as in the app.
const APA = /^(.*?) \(((?:\d{4}|n\.d\.)[^)]*)\)\. (\*[^*]+\*\.?|.+?[.?!])(?= |$)\s*(.*)$/;

function parseReference(text) {
  const href = text.match(/https?:\/\/\S+$/)?.[0] ?? null;
  const body = href ? text.slice(0, -href.length).trim() : text;
  const m = body.match(APA);
  if (!m) return { authors: null, year: null, title: body, venue: null, href };
  const [, authors, year, title, rest] = m;
  return {
    authors,
    year,
    title: title.replace(/\.$/, "").replace(/^\*|\*$/g, ""),
    venue: rest.replace(/\s*Retrieved .*? from$/, "").replace(/\.$/, "").trim() || null,
    href,
  };
}

const GUIDANCE = /Occupational Safety and Health Administration|National Institute for Occupational Safety/;

export const SOURCES = (() => {
  const byText = new Map();
  for (const article of ARTICLES) {
    for (const ref of article.references) {
      if (!byText.has(ref)) byText.set(ref, { ref, citedIn: [] });
      byText.get(ref).citedIn.push({ id: article.id, title: article.title });
    }
  }
  return [...byText.values()]
    .map(({ ref, citedIn }, i) => ({
      id: `ref-${i}`,
      type: GUIDANCE.test(ref) ? "Guidance" : "Research",
      ...parseReference(ref),
      citation: ref,
      citedIn,
    }))
    .sort((a, b) => a.citation.localeCompare(b.citation));
})();
