# Architecture

Open Indie Studio is Mode A: Pure GitHub Pages.

Live URL: https://baditaflorin.github.io/open-indie-studio/

Repository: https://github.com/baditaflorin/open-indie-studio

## Context

```mermaid
C4Context
  title Open Indie Studio Context
  Person(dev, "Solo indie developer")
  System_Boundary(pages, "GitHub Pages static hosting") {
    System(app, "Open Indie Studio", "Static browser app")
  }
  System_Ext(browserStorage, "IndexedDB", "Local browser storage")
  System_Ext(localLlm, "Local LLM Endpoint", "Optional user-owned endpoint")
  System_Ext(github, "GitHub Repository", "Source, stars, issues")
  Rel(dev, app, "Creates 2D/casual game projects")
  Rel(app, browserStorage, "Persists current project")
  Rel(app, localLlm, "Optional BYO prompt request")
  Rel(app, github, "Links to repository")
```

## Container

```mermaid
C4Container
  title Open Indie Studio Container View
  Person(dev, "Solo indie developer")
  System_Boundary(pages, "GitHub Pages") {
    Container(shell, "React App Shell", "React + TypeScript", "Project workflow UI")
    Container(canvas, "Scene Preview", "Canvas + browser APIs", "2D playtest rendering")
    Container(heavy, "Lazy Modules", "Three.js, Tone.js, Yjs", "Loaded only after user action")
    Container(exports, "Exporters", "TypeScript", "Project JSON, static HTML, Markdown")
  }
  ContainerDb(idb, "IndexedDB", "Browser storage", "Current project")
  System_Ext(localLlm, "Local LLM Endpoint", "Optional")
  Rel(dev, shell, "Uses")
  Rel(shell, canvas, "Updates scene")
  Rel(shell, heavy, "Loads on demand")
  Rel(shell, exports, "Creates artifacts")
  Rel(shell, idb, "Reads/writes")
  Rel(shell, localLlm, "Optional fetch")
```

## Module Boundaries

- `src/features/studio/`: project data, storage, and the primary workflow.
- `src/features/audio/`: Web Audio and Tone.js sketches.
- `src/features/rendering/`: canvas and Three.js preview support.
- `src/features/export/`: portable artifacts.
- `src/features/ai/`: local LLM client.
