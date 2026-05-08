import { z } from 'zod';
import type { StudioProject } from '../studio/projectState';

const LocalLlmResponseSchema = z
  .object({
    response: z.string().optional(),
    message: z
      .object({
        content: z.string().optional(),
      })
      .optional(),
  })
  .passthrough();

export async function askLocalLlm(
  endpoint: string,
  model: string,
  project: StudioProject,
  prompt: string,
): Promise<string> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      prompt: `${prompt}\n\nProject:\n${JSON.stringify(project, null, 2)}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Local LLM returned ${response.status}`);
  }

  const parsed = LocalLlmResponseSchema.parse(await response.json());
  return parsed.response ?? parsed.message?.content ?? 'No text returned by the local model.';
}
