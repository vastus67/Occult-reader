// Tests reading state data structures (pure logic, no SQLite)

interface ReadingState {
  bookId: string;
  chapterId?: string;
  passageId?: string;
  scrollOffset: number;
  updatedAt: string;
}

function createReadingState(
  bookId: string,
  chapterId?: string,
  passageId?: string,
  scrollOffset: number = 0
): ReadingState {
  return { bookId, chapterId, passageId, scrollOffset, updatedAt: new Date().toISOString() };
}

describe('Reading State', () => {
  it('creates reading state with defaults', () => {
    const state = createReadingState('kybalion');
    expect(state.bookId).toBe('kybalion');
    expect(state.scrollOffset).toBe(0);
    expect(state.updatedAt).toBeTruthy();
  });

  it('creates reading state with position', () => {
    const state = createReadingState('kybalion', 'kybalion_ch1', 'kybalion_ch1_p3', 150.5);
    expect(state.chapterId).toBe('kybalion_ch1');
    expect(state.passageId).toBe('kybalion_ch1_p3');
    expect(state.scrollOffset).toBe(150.5);
  });

  it('updatedAt is a valid ISO string', () => {
    const state = createReadingState('corpus_hermeticum');
    expect(() => new Date(state.updatedAt)).not.toThrow();
    expect(new Date(state.updatedAt).getTime()).not.toBeNaN();
  });

  it('chapterId and passageId are optional', () => {
    const state = createReadingState('occult_philosophy');
    expect(state.chapterId).toBeUndefined();
    expect(state.passageId).toBeUndefined();
  });

  it('preserves scroll offset precision', () => {
    const state = createReadingState('lesser_key', 'ch1', 'p1', 999.999);
    expect(state.scrollOffset).toBeCloseTo(999.999);
  });
});
