# Occult Library

A production-grade mobile app for reading public-domain occult and esoteric texts. Built with Expo (React Native + TypeScript).

## Features

- 📚 **Library** — Browse 5 public-domain books with rich metadata
- 📖 **Reader** — Verse-mode passage reader with typography controls (font size, line height, font family, dark/sepia theme)
- 🔍 **Full-text Search** — FTS5-powered search across all books with per-book filtering
- 📝 **Notes & Highlights** — Highlight passages, add notes, set bookmarks, export notes via share sheet
- ℹ️ **Sources & Legal** — Full attribution for every text with links to original sources

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo ~51 (React Native 0.74) |
| Navigation | expo-router ~3.5 (file-based) |
| Database | expo-sqlite ~14 (WAL mode + FTS5) |
| State | Zustand ^4.5 |
| Gestures | react-native-gesture-handler ~2.16 |
| Animations | react-native-reanimated ~3.10 |
| Language | TypeScript ~5.3 (strict) |

## Project Structure

```
src/
  app/            expo-router routes (library, book, reader, search, notes, sources)
  components/     Shared UI components
  features/       Feature-specific hooks (useLibrary, useBook, useReader, …)
  db/             SQLite schema, migrations, and typed queries
  content/        Book registry (metadata for all 5 books)
  store/          Zustand global store (settings + reading progress)
  theme/          Design tokens (Dracula + Candle Sepia palettes)
  utils/          normalizeText, buildFtsQuery, highlightSnippet
content/          Static JSON for all 5 books (chapters + passages)
scripts/          ingest.ts — convert raw .txt files to chapters.json
__tests__         Unit tests (Jest + jest-expo)
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm start

# 3. Run on iOS simulator
npm run ios

# 4. Run on Android emulator
npm run android
```

## Content Ingestion Pipeline

To add a new public-domain book:

1. **Obtain the text** — Download a plain-text version from Project Gutenberg, Sacred Texts, or similar.
2. **Create the book directory:**
   ```
   content/<book_id>/
     metadata.json    # id, title, author, description, tags, sortOrder, source, sourceUrl, licenseStatus
     chapters.json    # { "chapters": [{ "number", "title", "passages": [{ "number", "text" }] }] }
   ```
3. **Run the ingest script** (optional — for automatic parsing from raw .txt):
   ```bash
   npm run ingest <book_id> path/to/rawtext.txt
   ```
4. **Register the book** — Add an entry to `src/content/registry.ts` (BOOK_REGISTRY array).
5. **Wire up the content** — Add the `require()` entry in `src/app/_layout.tsx` under `bookContentFiles`.

## Legal / Source Attribution Checklist

Before adding any text, verify:

- [ ] Publication date is before 1928 (US public domain) **or** explicitly released to public domain
- [ ] Source URL is documented in `metadata.json`
- [ ] `licenseStatus` field is set to `"Public Domain"` with justification
- [ ] Author and translator (if applicable) are credited
- [ ] Edition and publication year are recorded
- [ ] The text does not include any post-1927 editorial additions still under copyright

## Current Books

| Book | Author | Year | Source |
|------|--------|------|--------|
| The Kybalion | Three Initiates | 1908 | Project Gutenberg |
| Corpus Hermeticum | Hermes Trismegistus (trans. G.R.S. Mead) | 1906 | Sacred Texts |
| Three Books of Occult Philosophy | H.C. Agrippa (trans. J.F.) | 1651 | Sacred Texts |
| The Lesser Key of Solomon | Anon. (trans. Mathers/Crowley) | 1904 | Sacred Texts |
| The Discoverie of Witchcraft | Reginald Scot | 1584 | Sacred Texts |

All texts are Public Domain.

## E2E Smoke Test Plan

| Screen | Test |
|--------|------|
| App launch | Splash screen shows → Library loads with 5 books |
| Library | All 5 book cards visible with correct titles |
| Book Overview | Title, author, tags, chapters list display correctly |
| Reader | Passages load, verse numbers toggle, typography panel works |
| Reader | Tap passage → toolbar appears → highlight/bookmark/note actions work |
| Search | Typing query → results appear → tap result → reader opens at correct chapter |
| Notes | Highlights, notes, and bookmarks all listed; filter by book works |
| Sources | All 5 books listed with correct attribution and working links |

## Unit Tests

```bash
npm test
```

Tests cover:
- `normalizeText` — lowercase, punctuation removal, whitespace collapsing, edge cases
- `buildFtsQuery` / `buildLikeQuery` — correct FTS5 query generation
- Reading state data structure — creation, defaults, ISO timestamp validation
Test
