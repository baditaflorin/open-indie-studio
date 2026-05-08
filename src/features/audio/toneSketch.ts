import type { StudioProject } from '../studio/projectState';

export async function playToneSketch(project: StudioProject): Promise<void> {
  const Tone = await import('tone');
  await Tone.start();

  Tone.Transport.stop();
  Tone.Transport.cancel();
  Tone.Transport.bpm.value = project.audio.tempo;

  const synth = new Tone.PolySynth(Tone.Synth).toDestination();
  const sequence = new Tone.Sequence(
    (time, note) => {
      synth.triggerAttackRelease(note, '8n', time);
    },
    project.audio.pattern,
    '8n',
  );

  sequence.start(0);
  Tone.Transport.start();

  window.setTimeout(() => {
    sequence.dispose();
    synth.dispose();
    Tone.Transport.stop();
    Tone.Transport.cancel();
  }, 3200);
}
