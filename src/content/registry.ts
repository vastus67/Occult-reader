export interface BookMeta {
  id: string;
  title: string;
  author: string;
  translator?: string;
  description: string;
  tags: string[];
  coverAsset?: string;
  sortOrder: number;
  edition: string;
  publicationYear?: number;
  source: string;
  sourceUrl: string;
  licenseStatus: string;
}

export const BOOK_REGISTRY: BookMeta[] = [
  {
    id: 'kybalion',
    title: 'The Kybalion',
    author: 'Three Initiates',
    description: 'A study of the Hermetic philosophy of ancient Egypt and Greece, presenting seven principles of the universe: Mentalism, Correspondence, Vibration, Polarity, Rhythm, Cause & Effect, and Gender.',
    tags: ['Hermeticism', 'Philosophy', 'Esoteric'],
    sortOrder: 1,
    edition: 'The Yogi Publication Society, 1908 (First Edition)',
    publicationYear: 1908,
    source: 'Project Gutenberg',
    sourceUrl: 'https://www.gutenberg.org/ebooks/9578',
    licenseStatus: 'Public Domain',
  },
  {
    id: 'corpus_hermeticum',
    title: 'Corpus Hermeticum',
    author: 'Hermes Trismegistus',
    translator: 'G.R.S. Mead',
    description: 'A collection of seventeen Greek texts attributed to Hermes Trismegistus, foundational to the Hermetic tradition, covering cosmology, theology, and mysticism.',
    tags: ['Hermeticism', 'Gnosticism', 'Ancient Texts'],
    sortOrder: 2,
    edition: 'Thrice-Greatest Hermes (Vol. 2), G.R.S. Mead translation, 1906',
    publicationYear: 1906,
    source: 'The Gnosis Archive / Sacred Texts',
    sourceUrl: 'https://www.sacred-texts.com/eso/hermetic.htm',
    licenseStatus: 'Public Domain',
  },
  {
    id: 'occult_philosophy',
    title: 'Three Books of Occult Philosophy',
    author: 'Heinrich Cornelius Agrippa',
    translator: 'J. F. (John French)',
    description: 'The foundational work of Renaissance magic, covering natural magic, celestial magic, and ceremonial magic across three comprehensive volumes.',
    tags: ['Ceremonial Magic', 'Renaissance', 'Kabbalah', 'Astrology'],
    sortOrder: 3,
    edition: 'London, 1651 (English Translation by J. F.)',
    publicationYear: 1651,
    source: 'Sacred Texts Archive',
    sourceUrl: 'https://www.sacred-texts.com/mag/gbop/index.htm',
    licenseStatus: 'Public Domain',
  },
  {
    id: 'lesser_key',
    title: 'The Lesser Key of Solomon',
    author: 'Anonymous',
    translator: 'S. L. MacGregor Mathers & Aleister Crowley',
    description: 'The Lemegeton, a 17th-century grimoire divided into five parts: Goetia, Theurgia Goetia, Ars Paulina, Ars Almadel, and Ars Notoria. An historical study of ceremonial magic traditions.',
    tags: ['Grimoire', 'Ceremonial Magic', 'Historical'],
    sortOrder: 4,
    edition: 'Mathers/Crowley edition, 1904',
    publicationYear: 1904,
    source: 'Sacred Texts Archive',
    sourceUrl: 'https://www.sacred-texts.com/grim/lks/index.htm',
    licenseStatus: 'Public Domain',
  },
  {
    id: 'discoverie_witchcraft',
    title: 'The Discoverie of Witchcraft',
    author: 'Reginald Scot',
    description: 'Published in 1584, this groundbreaking work challenged contemporary beliefs about witchcraft and demonology, arguing that alleged witches were innocent people suffering from delusion or misfortune.',
    tags: ['History', 'Skepticism', 'Witchcraft', 'Renaissance'],
    sortOrder: 5,
    edition: 'London, 1584 (First Edition reprint)',
    publicationYear: 1584,
    source: 'Sacred Texts Archive',
    sourceUrl: 'https://www.sacred-texts.com/pag/dow/index.htm',
    licenseStatus: 'Public Domain',
  },
];
