import { describe, expect, it } from 'vitest';
import { createStarterProject } from '../studio/projectState';
import { createPandocMarkdown, createPlaytestHtml } from './exportBuild';

describe('exportBuild', () => {
  it('creates a self-contained playtest html document', () => {
    const project = createStarterProject();
    const html = createPlaytestHtml(project);

    expect(html).toContain('<!doctype html>');
    expect(html).toContain('Pocket Quest Playtest');
    expect(html).toContain('requestAnimationFrame');
    expect(html).not.toContain('</script><script>');
  });

  it('creates a Pandoc-ready markdown brief', () => {
    const markdown = createPandocMarkdown(createStarterProject());

    expect(markdown).toContain('title: "Pocket Quest"');
    expect(markdown).toContain('## Sprites');
    expect(markdown).toContain('## Audio');
  });
});
