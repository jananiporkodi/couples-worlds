/**
 * A short, synthesized paper-unfolding "crinkle" sound - built entirely with the Web
 * Audio API (filtered noise burst) so opening a note doesn't need an audio file to
 * ship, host, or fail to load. Purely a nice-to-have: any failure here is swallowed
 * so it never blocks the note from opening.
 */
export function playPaperSound() {
  if (typeof window === "undefined") return;
  try {
    type WebkitWindow = typeof window & { webkitAudioContext?: typeof AudioContext };
    const AudioCtx = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const duration = 0.32;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 0.7;
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3200, ctx.currentTime + duration * 0.55);
    filter.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.45, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + duration);
    noise.onended = () => ctx.close();
  } catch {
    // sound is a nice-to-have - never let it break the UI
  }
}
