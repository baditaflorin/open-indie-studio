import { z } from 'zod';

export const spriteKinds = ['actor', 'collectible', 'hazard', 'terrain'] as const;

export const SpriteKindSchema = z.enum(spriteKinds);

export const SpriteSchema = z.object({
  id: z.string().min(1),
  kind: SpriteKindSchema,
  label: z.string().min(1).max(48),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0.03).max(0.3),
  height: z.number().min(0.03).max(0.3),
  vx: z.number().min(-1).max(1),
  vy: z.number().min(-1).max(1),
});

export const SceneSchema = z.object({
  name: z.string().min(1).max(80),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  goal: z.string().min(1).max(160),
  sprites: z.array(SpriteSchema).min(1),
});

export const AudioSketchSchema = z.object({
  tempo: z.number().int().min(70).max(180),
  rootNote: z.string().min(1).max(8),
  pattern: z.array(z.string().min(1).max(8)).min(1).max(16),
});

export const StudioProjectSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  description: z.string().max(220),
  updatedAt: z.string().datetime(),
  scene: SceneSchema,
  audio: AudioSketchSchema,
  checklist: z.array(z.string().min(1).max(80)).max(12),
  notes: z.string().max(2_000),
});

export type SpriteKind = z.infer<typeof SpriteKindSchema>;
export type StudioSprite = z.infer<typeof SpriteSchema>;
export type StudioProject = z.infer<typeof StudioProjectSchema>;

const defaultColors: Record<SpriteKind, string> = {
  actor: '#1d9a8a',
  collectible: '#f5b84b',
  hazard: '#be4c3a',
  terrain: '#4267ac',
};

const labels: Record<SpriteKind, string> = {
  actor: 'Hero',
  collectible: 'Pickup',
  hazard: 'Spike',
  terrain: 'Platform',
};

function createId(prefix: string): string {
  if ('crypto' in globalThis && 'randomUUID' in globalThis.crypto) {
    return `${prefix}_${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

export function touchProject(project: StudioProject): StudioProject {
  return { ...project, updatedAt: new Date().toISOString() };
}

export function createSprite(
  kind: SpriteKind,
  index = 0,
  color = defaultColors[kind],
): StudioSprite {
  const row = Math.floor(index / 4);
  const column = index % 4;

  return {
    id: createId(kind),
    kind,
    label: labels[kind],
    color,
    x: Math.min(0.78, 0.15 + column * 0.18),
    y: Math.min(0.76, 0.18 + row * 0.2),
    width: kind === 'terrain' ? 0.18 : 0.09,
    height: kind === 'terrain' ? 0.07 : 0.1,
    vx: kind === 'hazard' ? -0.08 : kind === 'actor' ? 0.14 : 0,
    vy: 0,
  };
}

export function createStarterProject(now = new Date()): StudioProject {
  return {
    schemaVersion: 1,
    id: createId('project'),
    name: 'Pocket Quest',
    description: 'A tiny collect-and-dodge prototype for quick playtests.',
    updatedAt: now.toISOString(),
    scene: {
      name: 'First Meadow',
      background: '#d9f0ef',
      goal: 'Collect every pickup before the timer runs out.',
      sprites: [
        createSprite('actor', 0),
        createSprite('collectible', 1),
        createSprite('hazard', 2),
        createSprite('terrain', 4),
      ],
    },
    audio: {
      tempo: 112,
      rootNote: 'C4',
      pattern: ['C4', 'E4', 'G4', 'B4', 'G4', 'E4'],
    },
    checklist: ['Scene', 'Controls', 'Audio', 'Export'],
    notes: 'Design for a 90-second browser playtest.',
  };
}

export function addSprite(project: StudioProject, kind: SpriteKind, color?: string): StudioProject {
  const nextSprite = createSprite(kind, project.scene.sprites.length, color ?? defaultColors[kind]);
  return touchProject({
    ...project,
    scene: {
      ...project.scene,
      sprites: [...project.scene.sprites, nextSprite],
    },
  });
}

export function updateSprite(
  project: StudioProject,
  spriteId: string,
  patch: Partial<Pick<StudioSprite, 'x' | 'y' | 'label' | 'color'>>,
): StudioProject {
  return touchProject({
    ...project,
    scene: {
      ...project.scene,
      sprites: project.scene.sprites.map((sprite) =>
        sprite.id === spriteId ? { ...sprite, ...patch } : sprite,
      ),
    },
  });
}

export function removeSprite(project: StudioProject, spriteId: string): StudioProject {
  const sprites = project.scene.sprites.filter((sprite) => sprite.id !== spriteId);
  return touchProject({
    ...project,
    scene: {
      ...project.scene,
      sprites: sprites.length > 0 ? sprites : [createSprite('actor')],
    },
  });
}

export function setProjectField<
  K extends keyof Pick<StudioProject, 'name' | 'description' | 'notes'>,
>(project: StudioProject, field: K, value: StudioProject[K]): StudioProject {
  return touchProject({ ...project, [field]: value });
}

export function setSceneField<
  K extends keyof Pick<StudioProject['scene'], 'name' | 'goal' | 'background'>,
>(project: StudioProject, field: K, value: StudioProject['scene'][K]): StudioProject {
  return touchProject({
    ...project,
    scene: { ...project.scene, [field]: value },
  });
}

export function setAudioField<K extends keyof StudioProject['audio']>(
  project: StudioProject,
  field: K,
  value: StudioProject['audio'][K],
): StudioProject {
  return touchProject({
    ...project,
    audio: { ...project.audio, [field]: value },
  });
}

export function readinessScore(project: StudioProject): number {
  const checks = [
    project.scene.sprites.some((sprite) => sprite.kind === 'actor'),
    project.scene.sprites.some((sprite) => sprite.kind === 'collectible'),
    project.scene.sprites.some((sprite) => sprite.kind === 'hazard'),
    project.audio.pattern.length >= 4,
  ];

  return checks.filter(Boolean).length;
}

export function serializeProject(project: StudioProject): string {
  return `${JSON.stringify(project, null, 2)}\n`;
}

export function parseProject(input: string): StudioProject {
  return StudioProjectSchema.parse(JSON.parse(input));
}
