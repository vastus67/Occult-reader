#!/usr/bin/env ts-node
/**
 * Ingest script: converts raw text files to structured chapters.json
 * Usage: ts-node scripts/ingest.ts <bookId> <inputFile.txt>
 * Output: content/<bookId>/chapters.json
 */
import * as fs from 'fs';
import * as path from 'path';

interface Passage {
  number: number;
  text: string;
}

interface Chapter {
  number: number;
  title: string;
  passages: Passage[];
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function ingestText(rawText: string): Chapter[] {
  const chapters: Chapter[] = [];
  const lines = rawText.split('\n');
  let currentChapter: Chapter | null = null;
  let chapterNum = 0;
  let passageNum = 0;
  let buffer: string[] = [];

  const flushBuffer = () => {
    if (buffer.length > 0 && currentChapter) {
      const text = buffer.join(' ').trim();
      if (text.length > 20) {
        passageNum++;
        currentChapter.passages.push({ number: passageNum, text });
      }
      buffer = [];
    }
  };

  const isChapterHeader = (line: string): boolean => {
    const trimmed = line.trim();
    return (
      /^(chapter|book|part|section)\s+[ivxlcdm\d]+/i.test(trimmed) ||
      /^[IVX]+\.\s+\w/i.test(trimmed) ||
      (trimmed.length > 5 && trimmed.length < 80 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed))
    );
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushBuffer();
      continue;
    }
    if (isChapterHeader(trimmed)) {
      flushBuffer();
      if (currentChapter && currentChapter.passages.length > 0) {
        chapters.push(currentChapter);
      }
      chapterNum++;
      passageNum = 0;
      currentChapter = { number: chapterNum, title: trimmed, passages: [] };
    } else {
      if (!currentChapter) {
        chapterNum = 1;
        currentChapter = { number: 1, title: 'Introduction', passages: [] };
      }
      buffer.push(trimmed);
    }
  }

  flushBuffer();
  if (currentChapter && currentChapter.passages.length > 0) {
    chapters.push(currentChapter);
  }

  return chapters;
}

const [,, bookId, inputFile] = process.argv;
if (!bookId || !inputFile) {
  console.error('Usage: ts-node scripts/ingest.ts <bookId> <inputFile.txt>');
  process.exit(1);
}

const rawText = fs.readFileSync(path.resolve(inputFile), 'utf-8');
const chapters = ingestText(rawText);
const output = { chapters };
const outputPath = path.resolve(`content/${bookId}/chapters.json`);
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
console.log(`✅ Ingested ${chapters.length} chapters with ${chapters.reduce((s, c) => s + c.passages.length, 0)} passages`);
console.log(`   Output: ${outputPath}`);
