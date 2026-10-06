// Locally synthesized soundscapes: no network, tracking, or audio downloads.
let context: AudioContext | null = null;
let master: GainNode | null = null;
const nodes: AudioNode[] = [];
export async function stopAudio() {
  nodes.splice(0).forEach((n) => n.disconnect());
  if (context) {
    await context.close();
    context = null;
    master = null;
  }
}
export function setVolume(volume: number) {
  if (master && context)
    master.gain.setTargetAtTime(
      (volume / 100) * 0.24,
      context.currentTime,
      0.2,
    );
}
export async function playAudio(sound: string, volume: number) {
  await stopAudio();
  if (sound === "Silence") return;
  context = new AudioContext();
  await context.resume();
  master = context.createGain();
  master.gain.value = (volume / 100) * 0.24;
  master.connect(context.destination);
  const buffer = context.createBuffer(
    1,
    context.sampleRate * 8,
    context.sampleRate,
  );
  const data = buffer.getChannelData(0);
  let brown = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    brown = (brown + white * 0.02) / 1.02;
    data[i] = sound === "Rain" ? white * 0.6 : brown * 4;
  }
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const filter = context.createBiquadFilter();
  filter.type = sound === "Night" ? "highpass" : "lowpass";
  filter.frequency.value =
    (
      {
        Rain: 1400,
        Cafe: 550,
        Fireplace: 420,
        Forest: 850,
        Ocean: 650,
        Night: 1800,
        "Soft wind": 330,
      } as Record<string, number>
    )[sound] ?? 600;
  source.connect(filter);
  filter.connect(master);
  source.start();
  nodes.push(source, filter);
  const lfo = context.createOscillator();
  const gain = context.createGain();
  lfo.frequency.value =
    sound === "Ocean" ? 0.09 : sound === "Fireplace" ? 9 : 0.25;
  gain.gain.value = 0.035;
  lfo.connect(gain);
  gain.connect(master.gain);
  lfo.start();
  nodes.push(lfo, gain);
  if (["Forest", "Night", "Cafe"].includes(sound)) {
    const tone = context.createOscillator();
    tone.type = "sine";
    tone.frequency.value =
      sound === "Cafe" ? 164 : sound === "Night" ? 2300 : 1700;
    const quiet = context.createGain();
    quiet.gain.value = sound === "Cafe" ? 0.07 : 0.025;
    tone.connect(quiet);
    quiet.connect(master);
    tone.start();
    nodes.push(tone, quiet);
  }
}
