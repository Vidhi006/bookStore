/**
 * Seed the BookHaven catalogue with public-domain books from Gutendex.
 *
 * Usage:
 *   npm run seed:books             # ~1280 books (40 pages)
 *   npm run seed:books -- --pages=40
 *
 * The script is idempotent: books are upserted by their Gutendex ISBN.
 */
import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';

// ── Env loading (Next.js isn't running this script) ──────────────────────────
function loadEnvFiles() {
  for (const file of ['.env.local', '.env']) {
    const fullPath = path.join(process.cwd(), file);
    if (!fs.existsSync(fullPath)) continue;
    for (const line of fs.readFileSync(fullPath, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const key = match[1];
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

loadEnvFiles();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is missing. Add it to .env.local or .env.');
  process.exit(1);
}

// ── Minimal Book schema (mirrors src/models/Book.ts) ─────────────────────────
const BookSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    isbn: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    rating: { type: Number, default: 4.5 },
    reviewCount: { type: Number, default: 0 },
    reviews: { type: Array, default: [] },
    genre: { type: String, required: true },
    stock: { type: Number, default: 10 },
    coverImage: { type: String, required: true },
    description: { type: String, default: '' },
    publishedYear: { type: Number },
    language: { type: String, default: 'English' },
    pages: { type: Number },
    publisher: { type: String },
    badge: { type: String },
  },
  { timestamps: true }
);

const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);

// ── Gutendex → BookHaven mapping ─────────────────────────────────────────────
const GUTENDEX_URL = 'https://gutendex.com/books/';
const FALLBACK_COVERS = [
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1495640452828-3df6795cf69b?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507842229452-7b6131346067?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
];

const LANGUAGE_NAMES = {
  en: 'English',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  nl: 'Dutch',
  fi: 'Finnish',
  la: 'Latin',
  el: 'Greek',
  zh: 'Chinese',
  ja: 'Japanese',
};

function classifyGenre(tags) {
  const t = tags.toLowerCase();
  if (/science fiction|space|interplanetary|alien|robot|future|time travel/.test(t)) return 'Sci-Fi';
  if (/mystery|detective|crime|murder|sherlock|secret|investigation/.test(t)) return 'Mystery';
  if (/self-help|conduct of life|success|happiness|ethics|motivat/.test(t)) return 'Self-Help';
  if (/science|physics|chemistry|biology|astronomy|mathematics|natural history/.test(t)) return 'Science';
  if (/fiction|novel|romance|adventure|short stories|children|poetry|drama|fairy/.test(t)) return 'Fiction';
  return 'Classic';
}

const USD_TO_INR = 83;

/** 1826 -> 1829, so seeded prices look like Indian MRPs (…9). */
function toIndianPrice(usd) {
  return Math.max(9, Math.round((usd * USD_TO_INR) / 10) * 10 - 1);
}

function mapBook(book) {
  const remoteId = Number(book.id);
  const authors = (book.authors || []).map((author) => author.name).filter(Boolean);
  const author = authors.length ? authors.join(', ') : 'Unknown Author';
  const subjects = (book.subjects || []).filter(Boolean);
  const bookshelves = (book.bookshelves || []).filter(Boolean);
  const genre = classifyGenre([...bookshelves, ...subjects].join(' '));
  const usdPrice = 9.99 + (remoteId % 2400) / 100;
  const price = toIndianPrice(usdPrice);
  const description = subjects.length
    ? `${book.title} by ${author} is a ${genre.toLowerCase()} work from Project Gutenberg. Themes include ${subjects
        .slice(0, 4)
        .join('; ')}.`
    : `${book.title} by ${author}, a public-domain classic from Project Gutenberg.`;

  return {
    id: `gut-${remoteId}`,
    isbn: `GUT-${remoteId}`,
    title: book.title,
    author,
    price,
    originalPrice: toIndianPrice(usdPrice * 1.35),
    rating: Math.min(5, Math.round((3.9 + (remoteId % 12) / 10) * 10) / 10),
    reviewCount: remoteId % 60,
    reviews: [],
    genre,
    stock: remoteId % 29 === 0 ? 0 : 3 + (remoteId % 23),
    coverImage:
      book.formats?.['image/jpeg'] ||
      FALLBACK_COVERS[remoteId % FALLBACK_COVERS.length],
    description,
    publishedYear: 1800 + (remoteId % 221),
    language: LANGUAGE_NAMES[book.languages?.[0]] || 'English',
    pages: 120 + (remoteId % 400),
    publisher: 'Project Gutenberg',
    badge: book.download_count > 5000 ? 'Popular Classic' : undefined,
  };
}

// ── Fetch helpers ────────────────────────────────────────────────────────────
async function fetchPage(page, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(`${GUTENDEX_URL}?page=${page}`, {
        headers: { 'User-Agent': 'BookHavenSeeder/1.0' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, 750 * attempt));
    }
  }
}

async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function run() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, run));
  return results;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const pagesArg = process.argv.find((arg) => arg.startsWith('--pages='));
  const totalPages = Math.max(1, Number(pagesArg?.split('=')[1]) || 40);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  console.log(`Fetching ${totalPages} Gutendex pages (${totalPages * 32} books max)…`);

  const unique = new Map();
  await mapWithConcurrency(pageNumbers, 6, async (page) => {
    const data = await fetchPage(page);
    for (const result of data.results || []) {
      if (result?.id) unique.set(result.id, result);
    }
    console.log(`  page ${page}: ${data.results?.length || 0} results (${unique.size} unique)`);
  });

  const mapped = Array.from(unique.values()).map(mapBook);
  console.log(`Mapped ${mapped.length} books. Writing to MongoDB…`);

  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 20000 });

  const operations = mapped.map((book) => ({
    updateOne: {
      filter: { isbn: book.isbn },
      update: { $set: book },
      upsert: true,
    },
  }));

  let inserted = 0;
  let upserted = 0;
  for (let start = 0; start < operations.length; start += 500) {
    const chunk = operations.slice(start, start + 500);
    const result = await Book.bulkWrite(chunk, { ordered: false });
    inserted += result.upsertedCount || 0;
    upserted += result.modifiedCount || 0;
    console.log(`  wrote ${Math.min(start + chunk.length, operations.length)} / ${operations.length}`);
  }

  const total = await Book.countDocuments();
  console.log(`Done. Inserted ${inserted}, updated ${upserted}. Catalogue now has ${total} books.`);

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('Seed failed:', error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
