import { normalizeText, highlightSnippet } from '../src/utils/normalize';

describe('normalizeText', () => {
  it('converts to lowercase', () => {
    expect(normalizeText('Hello World')).toBe('hello world');
  });
  it('removes punctuation', () => {
    const result = normalizeText('Hello, World!');
    expect(result).not.toContain(',');
    expect(result).not.toContain('!');
  });
  it('trims whitespace', () => {
    expect(normalizeText('  hello  ')).toBe('hello');
  });
  it('collapses multiple spaces', () => {
    expect(normalizeText('hello   world')).toBe('hello world');
  });
  it('handles empty string', () => {
    expect(normalizeText('')).toBe('');
  });
  it('handles special characters', () => {
    const result = normalizeText('test@#$%^&*()text');
    expect(result).toContain('test');
    expect(result).toContain('text');
    expect(result).not.toContain('@');
  });
});

describe('highlightSnippet', () => {
  it('returns text containing the match', () => {
    const text = 'The hermetic philosophy is ancient wisdom.';
    expect(highlightSnippet(text, 'hermetic')).toContain('hermetic');
  });
  it('truncates long text without match', () => {
    const text = 'a'.repeat(200);
    const snippet = highlightSnippet(text, 'xyz', 150);
    expect(snippet.length).toBeLessThanOrEqual(155);
  });
  it('handles empty query', () => {
    const text = 'short text';
    const snippet = highlightSnippet(text, '');
    expect(snippet).toBeDefined();
  });
  it('handles empty text', () => {
    expect(highlightSnippet('', 'query')).toBe('');
  });
});
