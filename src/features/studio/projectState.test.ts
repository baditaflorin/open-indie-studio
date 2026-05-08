import { describe, expect, it } from 'vitest';
import {
  addSprite,
  createStarterProject,
  parseProject,
  readinessScore,
  serializeProject,
  setAudioField,
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
});
