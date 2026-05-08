import { describe, expect, it } from 'vitest';
import { createStarterProject, StudioProjectSchema } from '../../src/features/studio/projectState';
import { createPlaytestHtml } from '../../src/features/export/exportBuild';

describe('static contract', () => {
  it('keeps exported projects on schema version 1', () => {
    const project = StudioProjectSchema.parse(createStarterProject());

    expect(project.schemaVersion).toBe(1);
  });

  it('keeps playtest exports free of remote runtime dependencies', () => {
    const html = createPlaytestHtml(createStarterProject());

    expect(html).not.toContain('http://');
    expect(html).not.toContain('https://');
  });
});
