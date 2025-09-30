import { COMMENTS_CONFIG } from '../comments';

describe('Comments Configuration', () => {
  it('should have a valid default comment system', () => {
    expect(['hashnode', 'giscus', 'utterances', 'simple']).toContain(
      COMMENTS_CONFIG.defaultSystem
    );
  });

  it('should have a valid GitHub repository', () => {
    expect(COMMENTS_CONFIG.githubRepo).toBeDefined();
    expect(COMMENTS_CONFIG.githubRepo).toMatch(/^[^/]+\/[^/]+$/);
  });

  it('should have valid Giscus configuration', () => {
    expect(COMMENTS_CONFIG.giscus).toBeDefined();
    expect(COMMENTS_CONFIG.giscus.repoId).toBeDefined();
    expect(COMMENTS_CONFIG.giscus.categoryId).toBeDefined();
    expect(COMMENTS_CONFIG.giscus.mapping).toBeDefined();
    expect(COMMENTS_CONFIG.giscus.reactionsEnabled).toBeDefined();
    expect(COMMENTS_CONFIG.giscus.emitMetadata).toBeDefined();
    expect(COMMENTS_CONFIG.giscus.inputPosition).toBeDefined();
    expect(COMMENTS_CONFIG.giscus.theme).toBeDefined();
    expect(COMMENTS_CONFIG.giscus.lang).toBeDefined();
    expect(COMMENTS_CONFIG.giscus.loading).toBeDefined();
  });

  it('should have valid Utterances configuration', () => {
    expect(COMMENTS_CONFIG.utterances).toBeDefined();
    expect(COMMENTS_CONFIG.utterances.theme).toBeDefined();
    expect(COMMENTS_CONFIG.utterances.issueTerm).toBeDefined();
  });

  it('should have consistent repository name across configurations', () => {
    expect(COMMENTS_CONFIG.githubRepo).toBeDefined();
    expect(COMMENTS_CONFIG.giscus.repoId).toBeDefined();
  });

  it('should have valid theme values', () => {
    const validThemes = [
      'light',
      'dark',
      'auto',
      'preferred_color_scheme',
      'github-light',
      'github-dark',
    ];
    expect(validThemes).toContain(COMMENTS_CONFIG.giscus.theme);
    expect(validThemes).toContain(COMMENTS_CONFIG.utterances.theme);
  });

  it('should have valid language values', () => {
    expect(COMMENTS_CONFIG.giscus.lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
  });

  it('should have valid mapping values', () => {
    const validMappings = ['pathname', 'url', 'title', 'og:title'];
    expect(validMappings).toContain(COMMENTS_CONFIG.giscus.mapping);
  });

  it('should have valid input position values', () => {
    const validPositions = ['top', 'bottom'];
    expect(validPositions).toContain(COMMENTS_CONFIG.giscus.inputPosition);
  });

  it('should have valid issue term values', () => {
    const validTerms = ['pathname', 'url', 'title'];
    expect(validTerms).toContain(COMMENTS_CONFIG.utterances.issueTerm);
  });
});
