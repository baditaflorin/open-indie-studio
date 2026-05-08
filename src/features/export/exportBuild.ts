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

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} Playtest</title>
<style>
html,body{margin:0;min-height:100%;font-family:system-ui,sans-serif;background:#101f24;color:#fffaf0}
main{width:min(960px,92vw);margin:0 auto;padding:24px}
canvas{width:100%;aspect-ratio:16/10;background:#d9f0ef;border:1px solid rgba(255,255,255,.2)}
.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:16px}
button{border:0;border-radius:6px;background:#f5b84b;color:#101f24;font-weight:800;padding:10px 14px}
</style>
</head>
<body>
<main>
<div class="bar"><div><h1>${title}</h1><p>${escapeHtml(project.scene.goal)}</p></div><button id="restart">Restart</button></div>
<canvas id="game" width="1280" height="800" aria-label="${title} playtest canvas"></canvas>
</main>
<script>
const project=${projectJson};
const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d');
let tick=0;
function drawSprite(sprite){
 const x=sprite.x*canvas.width;
 const y=sprite.y*canvas.height;
 const w=sprite.width*canvas.width;
 const h=sprite.height*canvas.height;
 ctx.fillStyle=sprite.color;
 if(sprite.kind==='actor'){ctx.beginPath();ctx.arc(x+w/2,y+h/2,Math.min(w,h)/2,0,Math.PI*2);ctx.fill();}
 else if(sprite.kind==='hazard'){ctx.beginPath();ctx.moveTo(x+w/2,y);ctx.lineTo(x+w,y+h);ctx.lineTo(x,y+h);ctx.closePath();ctx.fill();}
 else {ctx.fillRect(x,y,w,h);}
 ctx.fillStyle='#10282d';
 ctx.font='22px system-ui';
 ctx.fillText(sprite.label,x,Math.max(24,y-8));
}
function frame(){
 tick+=0.016;
 ctx.fillStyle=project.scene.background;
 ctx.fillRect(0,0,canvas.width,canvas.height);
 for(const sprite of project.scene.sprites){
   const drift=Math.sin(tick*2+sprite.x*5)*10;
   drawSprite({...sprite,y:Math.max(0,Math.min(.9,sprite.y+drift/canvas.height))});
 }
 requestAnimationFrame(frame);
}
document.getElementById('restart').addEventListener('click',()=>{tick=0;});
frame();
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
