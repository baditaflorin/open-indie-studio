import { describe, expect, it } from 'vitest';
import {
  addSprite,
  createStarterProject,
  parseProject,
  readinessScore,
  serializeProject,
  setAudioField,
  setProjectField,
  setSceneField,
  StudioProjectSchema,
} from './projectState';

describe('projectState', () => {
  it('creates a valid starter project', () => {
    const project = createStarterProject(new Date('2026-05-08T00:00:00.000Z'));

    expect(project.schemaVersion).toBe(1);
    expect(project.scene.sprites).toHaveLength(4);
    expect(readinessScore(project)).toBe(4);
  });

  it('adds sprites immutably', () => {
    const project = createStarterProject();
    const next = addSprite(project, 'collectible', '#f5b84b');

    expect(next).not.toBe(project);
    expect(next.scene.sprites).toHaveLength(project.scene.sprites.length + 1);
    expect(project.scene.sprites).toHaveLength(4);
  });

  it('roundtrips serialized project JSON', () => {
    const project = setAudioField(createStarterProject(), 'tempo', 128);
    const parsed = parseProject(serializeProject(project));

    expect(parsed.audio.tempo).toBe(128);
    expect(parsed.name).toBe(project.name);
  });

  // Regression test for a silent data-loss bug: storage.ts's loadStoredProject()
  // treats "fails schema validation" the same as "nothing stored" and falls back
  // to a brand new starter project with no warning to the user - and the very
  // next autosave then overwrites the last-good save with that fresh starter
  // project, destroying the original work permanently. None of the text inputs
  // in StudioApp.tsx enforced the schema's max-length limits, so simply typing a
  // long project name (no special characters needed) was enough to trigger this.
  // These setters must therefore guarantee the project they produce always
  // satisfies StudioProjectSchema, regardless of how much text is passed in.
  it('clamps free-text fields so state committed via setters always survives schema validation', () => {
    const overlong = 'x'.repeat(500);
    let project = createStarterProject();

    project = setProjectField(project, 'name', overlong);
    project = setProjectField(project, 'description', overlong);
    project = setSceneField(project, 'name', overlong);
    project = setSceneField(project, 'goal', overlong);
    project = setAudioField(project, 'rootNote', overlong);

    expect(project.name.length).toBeLessThanOrEqual(80);
    expect(project.description.length).toBeLessThanOrEqual(220);
    expect(project.scene.name.length).toBeLessThanOrEqual(80);
    expect(project.scene.goal.length).toBeLessThanOrEqual(160);
    expect(project.audio.rootNote.length).toBeLessThanOrEqual(8);

    // This is the exact check storage.ts's loadStoredProject() performs on
    // read-back (via StudioProjectSchema.safeParse). It must succeed, or the
    // saved project is silently discarded on the user's next page load.
    expect(StudioProjectSchema.safeParse(project).success).toBe(true);
  });
});
