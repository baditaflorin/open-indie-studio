import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  CircleDollarSign,
  Code2,
  Coins,
  Download,
  GitFork,
  HeartHandshake,
  Music,
  Package,
  Palette,
  Play,
  Plus,
  RefreshCcw,
  Save,
  Sparkles,
  TriangleAlert,
  Wand2,
} from 'lucide-react';
import { askLocalLlm } from '../ai/localLlm';
import { playToneSketch } from '../audio/toneSketch';
import { playWebAudioBlip } from '../audio/webAudio';
import { createYjsSnapshot } from '../collaboration/yjsSnapshot';
import { createPandocMarkdown, createPlaytestHtml, downloadText } from '../export/exportBuild';
import { ThreePreviewPanel } from '../rendering/ThreePreviewPanel';
import { SceneCanvas } from './SceneCanvas';
import {
  addSprite,
  createStarterProject,
  readinessScore,
  serializeProject,
  setAudioField,
  setProjectField,
  setSceneField,
  type SpriteKind,
  type StudioProject,
} from './projectState';
import { loadStoredProject, saveStoredProject } from './storage';

const repoUrl = __REPO_URL__;
const paypalUrl = __PAYPAL_URL__;

const swatches = ['#1d9a8a', '#f5b84b', '#be4c3a', '#4267ac', '#6a4fb3', '#ec7f52'];

function fileSlug(project: StudioProject): string {
  return project.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function CommitLink() {
  const commitUrl =
    __GIT_COMMIT__ === 'dev' ? repoUrl : `${repoUrl}/commit/${encodeURIComponent(__GIT_COMMIT__)}`;

  return (
    <a
      className="rounded-full border border-[#18303322] px-3 py-1 text-xs font-black text-[#0e2f35] hover:bg-white"
      href={commitUrl}
      target="_blank"
      rel="noreferrer"
    >
      v{__APP_VERSION__} · {__GIT_BRANCH__}@{__GIT_COMMIT__}
    </a>
  );
}

export function StudioApp() {
  const starterProject = useMemo(() => createStarterProject(), []);
  const [draftProject, setDraftProject] = useState<StudioProject | null>(null);
  const [selectedColor, setSelectedColor] = useState(swatches[0]);
  const [status, setStatus] = useState('Ready');
  const [llmEndpoint, setLlmEndpoint] = useState(
    import.meta.env.VITE_LOCAL_LLM_ENDPOINT ?? 'http://localhost:11434/api/generate',
  );
  const [llmModel, setLlmModel] = useState(import.meta.env.VITE_LOCAL_LLM_MODEL ?? 'llama3.2');
  const [llmPrompt, setLlmPrompt] = useState('Suggest one tighter mechanic for this prototype.');
  const [llmResult, setLlmResult] = useState('');

  const storedProjectQuery = useQuery({
    queryKey: ['stored-project'],
    queryFn: loadStoredProject,
  });

  const project = draftProject ?? storedProjectQuery.data ?? starterProject;

  const setProject = (next: StudioProject | ((current: StudioProject) => StudioProject)) => {
    setDraftProject((current) => {
      const base = current ?? storedProjectQuery.data ?? starterProject;
      return typeof next === 'function' ? next(base) : next;
    });
  };

  useEffect(() => {
    if (storedProjectQuery.isPending) {
      return;
    }
    const timeout = window.setTimeout(() => {
      void saveStoredProject(project).then(() => setStatus('Saved locally'));
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [project, storedProjectQuery.isPending]);

  const readiness = readinessScore(project);
  const spriteCounts = useMemo(() => {
    return project.scene.sprites.reduce<Record<SpriteKind, number>>(
      (counts, sprite) => ({ ...counts, [sprite.kind]: counts[sprite.kind] + 1 }),
      { actor: 0, collectible: 0, hazard: 0, terrain: 0 },
    );
  }, [project.scene.sprites]);

  const add = (kind: SpriteKind) => {
    setProject((current) => addSprite(current, kind, selectedColor));
    setStatus(`Added ${kind}`);
  };

  const exportJson = () => {
    downloadText(
      `${fileSlug(project)}.open-indie.json`,
      serializeProject(project),
      'application/json',
    );
    setStatus('Project JSON exported');
  };

  const exportHtml = () => {
    downloadText(`${fileSlug(project)}-playtest.html`, createPlaytestHtml(project), 'text/html');
    setStatus('Static playtest exported');
  };

  const exportBrief = () => {
    downloadText(`${fileSlug(project)}-brief.md`, createPandocMarkdown(project), 'text/markdown');
    setStatus('Pandoc-ready brief exported');
  };

  const copyYjsSnapshot = async () => {
    try {
      const snapshot = await createYjsSnapshot(project);
      await navigator.clipboard.writeText(snapshot);
      setStatus('Yjs snapshot copied');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Yjs snapshot failed');
    }
  };

  const askAi = async () => {
    try {
      setStatus('Asking local model');
      const result = await askLocalLlm(llmEndpoint, llmModel, project, llmPrompt);
      setLlmResult(result);
      setStatus('Local model replied');
    } catch (error) {
      setLlmResult(error instanceof Error ? error.message : 'Local model request failed');
      setStatus('Local model unavailable');
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f1e2] px-4 py-4 text-[#183033] sm:px-6 lg:px-8">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#1830331f] pb-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1d6f67]">
            Mode A · GitHub Pages
          </p>
          <h1 className="text-2xl font-black text-[#0e2f35] sm:text-3xl">Open Indie Studio</h1>
        </div>
        <nav className="flex flex-wrap items-center gap-2" aria-label="Project links">
          <CommitLink />
          <a className="icon-button px-3" href={repoUrl} target="_blank" rel="noreferrer">
            <GitFork size={18} aria-hidden="true" />
            Star repo
          </a>
          <a className="icon-button px-3" href={paypalUrl} target="_blank" rel="noreferrer">
            <HeartHandshake size={18} aria-hidden="true" />
            PayPal
          </a>
        </nav>
      </header>

      <div className="studio-grid">
        <aside className="space-y-4">
          <section className="panel rounded-lg p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-black text-[#0e2f35]">Project</h2>
              <span className="rounded-full bg-[#eaf2d9] px-2 py-1 text-xs font-black">
                {status}
              </span>
            </div>
            <label className="mb-3 block text-sm font-bold">
              Name
              <input
                className="mt-1 w-full rounded-md border border-[#1830332e] bg-white px-3 py-2"
                value={project.name}
                onChange={(event) =>
                  setProject((current) => setProjectField(current, 'name', event.target.value))
                }
              />
            </label>
            <label className="mb-3 block text-sm font-bold">
              Description
              <textarea
                className="mt-1 min-h-24 w-full resize-y rounded-md border border-[#1830332e] bg-white px-3 py-2"
                value={project.description}
                onChange={(event) =>
                  setProject((current) =>
                    setProjectField(current, 'description', event.target.value),
                  )
                }
              />
            </label>
            <div className="meter" aria-label={`Readiness ${readiness} of 4`}>
              {[0, 1, 2, 3].map((index) => (
                <span key={index} data-active={index < readiness} />
              ))}
            </div>
            <button
              className="icon-button warn mt-4 w-full px-3"
              type="button"
              onClick={() => {
                setProject(createStarterProject());
                setStatus('New project');
              }}
            >
              <RefreshCcw size={18} aria-hidden="true" />
              New project
            </button>
          </section>

          <section className="panel rounded-lg p-4">
            <div className="mb-3 flex items-center gap-2">
              <Palette size={18} aria-hidden="true" />
              <h2 className="text-base font-black text-[#0e2f35]">Assets</h2>
            </div>
            <div className="mb-4 flex flex-wrap gap-2" aria-label="Color swatches">
              {swatches.map((swatch) => (
                <button
                  key={swatch}
                  className="swatch"
                  style={{
                    background: swatch,
                    outline: selectedColor === swatch ? '3px solid #0e2f35' : 'none',
                  }}
                  type="button"
                  aria-label={`Select ${swatch}`}
                  onClick={() => setSelectedColor(swatch)}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                className="icon-button px-3"
                type="button"
                aria-label="Add actor"
                onClick={() => add('actor')}
              >
                <Plus size={17} aria-hidden="true" />
                Actor
              </button>
              <button
                className="icon-button px-3"
                type="button"
                aria-label="Add collectible"
                onClick={() => add('collectible')}
              >
                <Coins size={17} aria-hidden="true" />
                Pickup
              </button>
              <button
                className="icon-button px-3"
                type="button"
                aria-label="Add hazard"
                onClick={() => add('hazard')}
              >
                <TriangleAlert size={17} aria-hidden="true" />
                Hazard
              </button>
              <button
                className="icon-button px-3"
                type="button"
                aria-label="Add terrain"
                onClick={() => add('terrain')}
              >
                <Box size={17} aria-hidden="true" />
                Terrain
              </button>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {Object.entries(spriteCounts).map(([kind, count]) => (
                <div key={kind} className="rounded-md bg-white px-3 py-2">
                  <dt className="font-black capitalize">{kind}</dt>
                  <dd>{count}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="panel rounded-lg p-4">
            <div className="mb-3 flex items-center gap-2">
              <Package size={18} aria-hidden="true" />
              <h2 className="text-base font-black text-[#0e2f35]">Distribution</h2>
            </div>
            <div className="grid gap-2">
              <button className="icon-button px-3" type="button" onClick={exportJson}>
                <Save size={18} aria-hidden="true" />
                Project JSON
              </button>
              <button className="icon-button primary px-3" type="button" onClick={exportHtml}>
                <Play size={18} aria-hidden="true" />
                Playtest HTML
              </button>
              <button className="icon-button px-3" type="button" onClick={exportBrief}>
                <Download size={18} aria-hidden="true" />
                Markdown brief
              </button>
            </div>
          </section>
        </aside>

        <section className="space-y-4">
          <section className="panel rounded-lg p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-[#0e2f35]">{project.scene.name}</h2>
                <p className="text-sm font-semibold text-[#416267]">{project.scene.goal}</p>
              </div>
              <label className="text-sm font-bold">
                Backdrop
                <input
                  className="ml-2 h-9 w-12 rounded border border-[#1830332e]"
                  type="color"
                  value={project.scene.background}
                  onChange={(event) =>
                    setProject((current) =>
                      setSceneField(current, 'background', event.target.value),
                    )
                  }
                />
              </label>
            </div>
            <SceneCanvas project={project} />
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-bold">
                Scene
                <input
                  className="mt-1 w-full rounded-md border border-[#1830332e] bg-white px-3 py-2"
                  value={project.scene.name}
                  onChange={(event) =>
                    setProject((current) => setSceneField(current, 'name', event.target.value))
                  }
                />
              </label>
              <label className="text-sm font-bold">
                Goal
                <input
                  className="mt-1 w-full rounded-md border border-[#1830332e] bg-white px-3 py-2"
                  value={project.scene.goal}
                  onChange={(event) =>
                    setProject((current) => setSceneField(current, 'goal', event.target.value))
                  }
                />
              </label>
            </div>
          </section>

          <section className="panel rounded-lg p-4">
            <div className="mb-3 flex items-center gap-2">
              <Code2 size={18} aria-hidden="true" />
              <h2 className="text-base font-black text-[#0e2f35]">Code Loop</h2>
            </div>
            <pre className="overflow-auto rounded-md bg-[#0e2f35] p-4 text-sm text-[#fffaf0]">
              {`for each frame:
  read input
  move actor
  collect pickups
  avoid hazards
  render ${project.scene.sprites.length} sprites`}
            </pre>
            <button className="icon-button mt-3 px-3" type="button" onClick={copyYjsSnapshot}>
              <Sparkles size={18} aria-hidden="true" />
              Copy Yjs snapshot
            </button>
          </section>
        </section>

        <aside className="space-y-4">
          <section className="panel rounded-lg p-4">
            <div className="mb-3 flex items-center gap-2">
              <Music size={18} aria-hidden="true" />
              <h2 className="text-base font-black text-[#0e2f35]">Audio</h2>
            </div>
            <label className="mb-3 block text-sm font-bold">
              Tempo {project.audio.tempo}
              <input
                className="mt-2 w-full accent-[#1d9a8a]"
                type="range"
                min="70"
                max="180"
                value={project.audio.tempo}
                onChange={(event) =>
                  setProject((current) =>
                    setAudioField(current, 'tempo', Number(event.target.value)),
                  )
                }
              />
            </label>
            <label className="mb-3 block text-sm font-bold">
              Root note
              <input
                className="mt-1 w-full rounded-md border border-[#1830332e] bg-white px-3 py-2"
                value={project.audio.rootNote}
                onChange={(event) =>
                  setProject((current) => setAudioField(current, 'rootNote', event.target.value))
                }
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                className="icon-button px-3"
                type="button"
                onClick={() => playWebAudioBlip(523.25)}
              >
                <CircleDollarSign size={18} aria-hidden="true" />
                Blip
              </button>
              <button
                className="icon-button primary px-3"
                type="button"
                onClick={() =>
                  void playToneSketch(project)
                    .then(() => setStatus('Tone sketch played'))
                    .catch((error: unknown) =>
                      setStatus(error instanceof Error ? error.message : 'Tone sketch failed'),
                    )
                }
              >
                <Music size={18} aria-hidden="true" />
                Tone
              </button>
            </div>
          </section>

          <ThreePreviewPanel />

          <section className="panel rounded-lg p-4">
            <div className="mb-3 flex items-center gap-2">
              <Wand2 size={18} aria-hidden="true" />
              <h2 className="text-base font-black text-[#0e2f35]">Local LLM</h2>
            </div>
            <label className="mb-3 block text-sm font-bold">
              Endpoint
              <input
                className="mt-1 w-full rounded-md border border-[#1830332e] bg-white px-3 py-2"
                value={llmEndpoint}
                onChange={(event) => setLlmEndpoint(event.target.value)}
              />
            </label>
            <label className="mb-3 block text-sm font-bold">
              Model
              <input
                className="mt-1 w-full rounded-md border border-[#1830332e] bg-white px-3 py-2"
                value={llmModel}
                onChange={(event) => setLlmModel(event.target.value)}
              />
            </label>
            <label className="mb-3 block text-sm font-bold">
              Prompt
              <textarea
                className="mt-1 min-h-20 w-full resize-y rounded-md border border-[#1830332e] bg-white px-3 py-2"
                value={llmPrompt}
                onChange={(event) => setLlmPrompt(event.target.value)}
              />
            </label>
            <button
              className="icon-button primary w-full px-3"
              type="button"
              onClick={() => void askAi()}
            >
              <Sparkles size={18} aria-hidden="true" />
              Ask
            </button>
            {llmResult ? (
              <output className="mt-3 block whitespace-pre-wrap rounded-md bg-white p-3 text-sm font-semibold">
                {llmResult}
              </output>
            ) : null}
          </section>
        </aside>
      </div>
    </main>
  );
}
