import type { StudioProject } from '../studio/projectState';

function safeJsonForScript(project: StudioProject): string {
  return JSON.stringify(project).replace(/</g, '\\u003c');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function createPlaytestHtml(project: StudioProject): string {
  const projectJson = safeJsonForScript(project);
  const title = escapeHtml(project.name);

  // A real "playtest" needs at least: keyboard input, collisions with each
  // sprite kind, a win condition when all collectibles are gathered, and a
  // lose-and-restart loop on hazard hits. Previously the exported HTML just
  // drifted every sprite on a sine wave, so the "Builds a small playable 2D
  // scene" claim wasn't actually delivered. The script below ships all of
  // those gameplay rules inline so the exported file is self-contained.
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} Playtest</title>
<style>
html,body{margin:0;min-height:100%;font-family:system-ui,sans-serif;background:#101f24;color:#fffaf0}
main{width:min(960px,92vw);margin:0 auto;padding:24px}
canvas{width:100%;aspect-ratio:16/10;background:#d9f0ef;border:1px solid rgba(255,255,255,.2);touch-action:none}
.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:16px;flex-wrap:wrap}
button{border:0;border-radius:6px;background:#f5b84b;color:#101f24;font-weight:800;padding:10px 14px;cursor:pointer}
.hud{display:flex;gap:18px;align-items:center;font-weight:700}
.hud span{background:rgba(255,255,255,.08);padding:6px 10px;border-radius:6px}
.help{margin:8px 0 0;opacity:.85;font-size:13px}
.banner{position:fixed;inset:auto 0 24px 0;text-align:center}
.banner b{background:#f5b84b;color:#101f24;padding:10px 16px;border-radius:6px;display:inline-block}
</style>
</head>
<body>
<main>
<div class="bar">
  <div>
    <h1>${title}</h1>
    <p>${escapeHtml(project.scene.goal)}</p>
    <p class="help">Move: arrow keys or WASD. Collect every pickup; dodge spikes.</p>
  </div>
  <div class="hud">
    <span id="score">Score 0/0</span>
    <span id="lives">Lives 3</span>
    <button id="restart">Restart</button>
  </div>
</div>
<canvas id="game" width="1280" height="800" aria-label="${title} playtest canvas"></canvas>
</main>
<div class="banner" id="banner" hidden><b id="banner-text">You win!</b></div>
<script>
(function(){
  const project = ${projectJson};
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');
  const banner = document.getElementById('banner');
  const bannerText = document.getElementById('banner-text');

  const PLAYER_SPEED = 0.32; // scene-fractions per second
  const TARGET_FPS = 60;
  const startingLives = 3;

  function deepClone(value){return JSON.parse(JSON.stringify(value));}
  function rect(sprite){
    return {
      x: sprite.x,
      y: sprite.y,
      w: sprite.width,
      h: sprite.height,
    };
  }
  function overlaps(a,b){
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  let state;
  function reset(){
    state = {
      sprites: deepClone(project.scene.sprites),
      collected: 0,
      lives: startingLives,
      status: 'playing',
    };
    state.total = state.sprites.filter(function(s){return s.kind === 'collectible';}).length;
    banner.hidden = true;
    updateHud();
  }
  function findActor(){
    return state.sprites.find(function(s){return s.kind === 'actor';});
  }
  function respawnActor(){
    const original = project.scene.sprites.find(function(s){return s.kind === 'actor';});
    const actor = findActor();
    if(!original || !actor) return;
    actor.x = original.x;
    actor.y = original.y;
    actor.vx = 0;
    actor.vy = 0;
  }
  function updateHud(){
    scoreEl.textContent = 'Score ' + state.collected + '/' + state.total;
    livesEl.textContent = 'Lives ' + state.lives;
  }
  function endGame(message){
    state.status = 'ended';
    bannerText.textContent = message;
    banner.hidden = false;
  }

  const input = { up:false, down:false, left:false, right:false };
  const keys = {
    ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right',
    KeyW:'up', KeyS:'down', KeyA:'left', KeyD:'right',
  };
  window.addEventListener('keydown', function(event){
    const dir = keys[event.code];
    if(dir){ input[dir] = true; event.preventDefault(); }
  });
  window.addEventListener('keyup', function(event){
    const dir = keys[event.code];
    if(dir){ input[dir] = false; event.preventDefault(); }
  });

  function step(dt){
    if(state.status !== 'playing') return;
    const actor = findActor();
    if(!actor) return;
    const moveX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const moveY = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    const stepLen = PLAYER_SPEED * dt;
    let nextX = Math.max(0, Math.min(1 - actor.width, actor.x + moveX * stepLen));
    let nextY = Math.max(0, Math.min(1 - actor.height, actor.y + moveY * stepLen));

    // Terrain collision: snap actor out of the terrain box on the axis with the
    // smallest overlap, so the player slides along edges instead of phasing
    // through.
    const moved = { x: nextX, y: nextY, w: actor.width, h: actor.height };
    for(const sprite of state.sprites){
      if(sprite.kind !== 'terrain') continue;
      const block = rect(sprite);
      if(!overlaps(moved, block)) continue;
      const overlapX = Math.min(moved.x + moved.w - block.x, block.x + block.w - moved.x);
      const overlapY = Math.min(moved.y + moved.h - block.y, block.y + block.h - moved.y);
      if(overlapX < overlapY){
        nextX = moved.x < block.x ? block.x - moved.w - 0.001 : block.x + block.w + 0.001;
      } else {
        nextY = moved.y < block.y ? block.y - moved.h - 0.001 : block.y + block.h + 0.001;
      }
      moved.x = nextX;
      moved.y = nextY;
    }
    actor.x = nextX;
    actor.y = nextY;

    const actorBox = rect(actor);
    // Collect pickups
    state.sprites = state.sprites.filter(function(sprite){
      if(sprite.kind !== 'collectible') return true;
      if(!overlaps(actorBox, rect(sprite))) return true;
      state.collected += 1;
      return false;
    });
    if(state.collected >= state.total && state.total > 0){
      updateHud();
      endGame('You collected everything!');
      return;
    }

    // Hazard hit
    for(const sprite of state.sprites){
      if(sprite.kind !== 'hazard') continue;
      if(!overlaps(actorBox, rect(sprite))) continue;
      state.lives -= 1;
      respawnActor();
      if(state.lives <= 0){
        updateHud();
        endGame('Out of lives. Press Restart to try again.');
        return;
      }
      break;
    }
    updateHud();
  }

  function draw(){
    ctx.fillStyle = project.scene.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for(const sprite of state.sprites){
      const x = sprite.x * canvas.width;
      const y = sprite.y * canvas.height;
      const w = sprite.width * canvas.width;
      const h = sprite.height * canvas.height;
      ctx.fillStyle = sprite.color;
      if(sprite.kind === 'actor'){
        ctx.beginPath();
        ctx.arc(x + w/2, y + h/2, Math.min(w, h) / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if(sprite.kind === 'hazard'){
        ctx.beginPath();
        ctx.moveTo(x + w/2, y);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(x, y, w, h);
      }
      ctx.fillStyle = '#10282d';
      ctx.font = '22px system-ui';
      ctx.fillText(sprite.label, x, Math.max(24, y - 8));
    }
  }

  let lastFrame = 0;
  function frame(now){
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    if(dt > 0) step(dt);
    draw();
    requestAnimationFrame(frame);
  }

  document.getElementById('restart').addEventListener('click', function(){
    reset();
  });

  reset();
  requestAnimationFrame(function(now){ lastFrame = now; frame(now); });
})();
</script>
</body>
</html>
`;
}

export function createPandocMarkdown(project: StudioProject): string {
  const sprites = project.scene.sprites
    .map(
      (sprite) =>
        `- ${sprite.kind}: ${sprite.label} at ${Math.round(sprite.x * 100)}%, ${Math.round(sprite.y * 100)}%`,
    )
    .join('\n');

  return `---
title: "${project.name}"
subtitle: "Open Indie Studio design brief"
schema-version: ${project.schemaVersion}
---

# ${project.name}

${project.description}

## Scene

- Name: ${project.scene.name}
- Goal: ${project.scene.goal}
- Background: ${project.scene.background}

## Sprites

${sprites}

## Audio

- Tempo: ${project.audio.tempo}
- Root note: ${project.audio.rootNote}
- Pattern: ${project.audio.pattern.join(', ')}

## Notes

${project.notes}
`;
}

export function downloadText(filename: string, text: string, type: string): void {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
