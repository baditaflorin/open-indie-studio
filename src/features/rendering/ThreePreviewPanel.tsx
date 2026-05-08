import { useEffect, useRef, useState } from 'react';
import { Box, Cpu } from 'lucide-react';

export function ThreePreviewPanel() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState('Idle');
  const hasWebGpu = 'gpu' in navigator;

  useEffect(() => {
    if (!enabled || !containerRef.current) {
      return;
    }

    let cancelled = false;
    setStatus('Loading Three.js');

    void import('./threePreview')
      .then(({ mountThreePreview }) => mountThreePreview(containerRef.current!))
      .then((cleanup) => {
        if (cancelled) {
          cleanup();
          return;
        }
        cleanupRef.current = cleanup;
        setStatus(hasWebGpu ? 'WebGPU available, preview running' : 'WebGL preview running');
      })
      .catch((error: unknown) => {
        setStatus(error instanceof Error ? error.message : 'Preview failed');
      });

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [enabled, hasWebGpu]);

  return (
    <section className="panel rounded-lg p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-black text-[#0e2f35]">GPU Preview</h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#e4f5f1] px-2 py-1 text-xs font-bold text-[#0e2f35]">
          <Cpu size={14} aria-hidden="true" />
          {status}
        </span>
      </div>
      <div
        ref={containerRef}
        className="grid aspect-[16/10] min-h-48 place-items-center rounded-md border border-[#1830332e] bg-[#0e2f35] text-sm font-bold text-[#fffaf0]"
      >
        {!enabled ? 'Three.js chunk not loaded' : null}
      </div>
      <button
        className="icon-button mt-3 w-full px-3"
        type="button"
        onClick={() => setEnabled((value) => !value)}
      >
        <Box size={18} aria-hidden="true" />
        {enabled ? 'Stop preview' : 'Start preview'}
      </button>
    </section>
  );
}
