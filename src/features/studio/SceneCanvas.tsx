import { useEffect, useRef } from 'react';
import type { StudioProject } from './projectState';

interface SceneCanvasProps {
  project: StudioProject;
}

export function SceneCanvas({ project }: SceneCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) {
      return;
    }

    let frame = 0;
    let tick = 0;
    const draw = () => {
      tick += 0.016;
      context.fillStyle = project.scene.background;
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.strokeStyle = 'rgba(14,47,53,0.08)';
      context.lineWidth = 2;
      for (let x = 0; x <= canvas.width; x += canvas.width / 8) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, canvas.height);
        context.stroke();
      }
      for (let y = 0; y <= canvas.height; y += canvas.height / 5) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvas.width, y);
        context.stroke();
      }

      project.scene.sprites.forEach((sprite, index) => {
        const wobble = sprite.kind === 'terrain' ? 0 : Math.sin(tick * 2 + index) * 5;
        const x = sprite.x * canvas.width;
        const y = sprite.y * canvas.height + wobble;
        const width = sprite.width * canvas.width;
        const height = sprite.height * canvas.height;

        context.fillStyle = sprite.color;
        context.strokeStyle = 'rgba(14,47,53,0.72)';
        context.lineWidth = 4;

        if (sprite.kind === 'actor') {
          context.beginPath();
          context.arc(x + width / 2, y + height / 2, Math.min(width, height) / 2, 0, Math.PI * 2);
          context.fill();
          context.stroke();
        } else if (sprite.kind === 'hazard') {
          context.beginPath();
          context.moveTo(x + width / 2, y);
          context.lineTo(x + width, y + height);
          context.lineTo(x, y + height);
          context.closePath();
          context.fill();
          context.stroke();
        } else {
          context.beginPath();
          context.roundRect(x, y, width, height, 12);
          context.fill();
          context.stroke();
        }

        context.fillStyle = '#0e2f35';
        context.font = '700 24px system-ui';
        context.fillText(sprite.label, x, Math.max(28, y - 10));
      });

      frame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frame);
  }, [project]);

  return (
    <canvas
      ref={canvasRef}
      className="scene-canvas rounded-lg"
      width={1280}
      height={800}
      aria-label={`${project.name} scene preview`}
      data-testid="scene-canvas"
    />
  );
}
