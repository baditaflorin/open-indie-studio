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

  it('embeds real gameplay: keyboard input, collision, win/lose, and a HUD', () => {
    const html = createPlaytestHtml(createStarterProject());

    // Keyboard input wiring
    expect(html).toContain('ArrowUp');
    expect(html).toContain('KeyW');
    expect(html).toContain('keydown');
    expect(html).toContain('keyup');

    // Collision routines for the four sprite kinds
    expect(html).toContain('overlaps(');
    expect(html).toContain("'collectible'");
    expect(html).toContain("'hazard'");
    expect(html).toContain("'terrain'");

    // Win / lose / lives state machine
    expect(html).toContain('state.collected');
    expect(html).toContain('state.lives');
    expect(html).toContain('You collected everything!');
    expect(html).toContain('Out of lives');

    // HUD
    expect(html).toContain('id="score"');
    expect(html).toContain('id="lives"');
    expect(html).toContain('id="restart"');
  });

  it('creates a Pandoc-ready markdown brief', () => {
    const markdown = createPandocMarkdown(createStarterProject());

    expect(markdown).toContain('title: "Pocket Quest"');
    expect(markdown).toContain('## Sprites');
    expect(markdown).toContain('## Audio');
  });
});
