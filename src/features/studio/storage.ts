import { get, set } from 'idb-keyval';
import { StudioProjectSchema, type StudioProject } from './projectState';

const storageKey = 'open-indie-studio:project:v1';

export async function loadStoredProject(): Promise<StudioProject | null> {
  const stored = await get<unknown>(storageKey);
  if (!stored) {
    return null;
  }

  const parsed = StudioProjectSchema.safeParse(stored);
  return parsed.success ? parsed.data : null;
}

export async function saveStoredProject(project: StudioProject): Promise<void> {
  await set(storageKey, project);
}
