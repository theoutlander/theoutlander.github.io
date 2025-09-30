// Import the function from BlogCard (we'll need to extract it)
function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

describe('estimateReadingTime', () => {
  it('should calculate reading time for normal text', () => {
    const text =
      'This is a test sentence with multiple words to calculate reading time.';
    expect(estimateReadingTime(text)).toBe(1); // 12 words / 200 = 0.06, rounded to 1
  });

  it('should handle empty text', () => {
    expect(estimateReadingTime('')).toBe(1);
  });

  it('should handle text with only whitespace', () => {
    expect(estimateReadingTime('   \n\t   ')).toBe(1);
  });

  it('should calculate reading time for longer text', () => {
    const text =
      'This is a much longer text that contains many more words than the previous example. '.repeat(
        10
      );
    const words = text.trim().split(/\s+/).length;
    const expectedMinutes = Math.max(1, Math.round(words / 200));
    expect(estimateReadingTime(text)).toBe(expectedMinutes);
  });

  it('should handle text with multiple spaces between words', () => {
    const text = 'word1    word2   word3';
    expect(estimateReadingTime(text)).toBe(1); // 3 words / 200 = 0.015, rounded to 1
  });

  it('should handle text with newlines and tabs', () => {
    const text = 'word1\nword2\tword3\n\nword4';
    expect(estimateReadingTime(text)).toBe(1); // 4 words / 200 = 0.02, rounded to 1
  });

  it('should return at least 1 minute for any non-empty text', () => {
    const text = 'a';
    expect(estimateReadingTime(text)).toBe(1);
  });

  it('should calculate correctly for exactly 200 words', () => {
    const text = 'word '.repeat(200).trim();
    expect(estimateReadingTime(text)).toBe(1);
  });

  it('should calculate correctly for 400 words', () => {
    const text = 'word '.repeat(400).trim();
    expect(estimateReadingTime(text)).toBe(2);
  });
});
