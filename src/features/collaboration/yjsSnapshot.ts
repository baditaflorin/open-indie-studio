import type { StudioProject } from '../studio/projectState';

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export async function createYjsSnapshot(project: StudioProject): Promise<string> {
  const Y = await import('yjs');
  const doc = new Y.Doc();
  const projectMap = doc.getMap('project');

  projectMap.set('schemaVersion', project.schemaVersion);
  projectMap.set('payload', project);
  projectMap.set('createdAt', new Date().toISOString());

  return bytesToBase64(Y.encodeStateAsUpdate(doc));
}
