import { buildFtsQuery, buildLikeQuery } from '../src/utils/search';

describe('buildFtsQuery', () => {
  it('builds a quoted FTS5 query from plain text', () => {
    const q = buildFtsQuery('hermetic philosophy');
    expect(q).toContain('"hermetic"*');
    expect(q).toContain('"philosophy"*');
  });
  it('handles single word', () => {
    const q = buildFtsQuery('alchemy');
    expect(q).toBe('"alchemy"*');
  });
  it('normalizes input', () => {
    const q = buildFtsQuery('Hermes Trismegistus!');
    expect(q).toContain('"hermes"*');
    expect(q).toContain('"trismegistus"*');
  });
  it('filters empty tokens', () => {
    const q = buildFtsQuery('  alchemy  ');
    expect(q).toBe('"alchemy"*');
  });
});

describe('buildLikeQuery', () => {
  it('wraps query in %', () => {
    expect(buildLikeQuery('hermetic')).toBe('%hermetic%');
  });
  it('normalizes to lowercase', () => {
    expect(buildLikeQuery('Hermetic')).toBe('%hermetic%');
  });
  it('handles multi-word query', () => {
    const q = buildLikeQuery('hermetic philosophy');
    expect(q).toBe('%hermetic philosophy%');
  });
});
