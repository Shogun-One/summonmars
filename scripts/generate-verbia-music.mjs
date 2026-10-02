import fs from "node:fs";

const rate = 48000;
const seconds = 32;
const frames = rate * seconds;
const tau = Math.PI * 2;
const dry = new Float32Array(frames);
const midi = value => 440 * 2 ** ((value - 69) / 12);
const chords = [
  [48, 55, 59, 64, 67], // Cmaj9
  [45, 52, 55, 60, 64], // Am7
  [50, 57, 60, 64, 69], // Dm9
  [43, 50, 53, 59, 64]  // G13
];
const melody = [76,79,83,79,76,72,74,76,77,81,84,81,79,77,74,71];
const circularDistance = (left, right) => {
  let value = Math.abs(left - right) % seconds;
  return Math.min(value, seconds - value);
};
const noise = index => {
  const value = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return (value - Math.floor(value)) * 2 - 1;
};

for (let index = 0; index < frames; index++) {
  const time = index / rate;
  let sample = 0;

  chords.forEach((notes, chordIndex) => {
    const center = chordIndex * 8 + 4;
    const distance = circularDistance(time, center);
    if (distance >= 5) return;
    const weight = .5 + .5 * Math.cos(Math.PI * distance / 5);
    notes.forEach((note, voice) => {
      const frequency = midi(note);
      const phase = tau * frequency * time + voice * .39;
      const shimmer = 1 + .0022 * Math.sin(tau * (.07 + voice * .009) * time);
      sample += weight * (.026 * Math.sin(phase * shimmer) + .008 * Math.sin(phase * 2.002)) / (1 + voice * .18);
    });
    const bass = midi(notes[0] - 12);
    sample += weight * (.038 * Math.sin(tau * bass * time) + .012 * Math.sin(tau * bass * 2 * time));
  });

  const step = Math.floor(time / 2) % melody.length;
  const stepTime = time % 2;
  const pluckEnvelope = (1 - Math.exp(-stepTime * 24)) * Math.exp(-stepTime * 2.7);
  const lead = midi(melody[step]);
  sample += pluckEnvelope * (.052 * Math.sin(tau * lead * time) + .016 * Math.sin(tau * lead * 2.01 * time));

  const beatTime = time % 2;
  const kickEnvelope = Math.exp(-beatTime * 9);
  sample += .025 * kickEnvelope * Math.sin(tau * (58 + 24 * Math.exp(-beatTime * 18)) * time);
  const brushTime = time % 1;
  const brushEnvelope = Math.exp(-brushTime * 20);
  sample += noise(index) * brushEnvelope * .0065;

  sample += .007 * Math.sin(tau * (midi(88) + 2.4 * Math.sin(tau * .03125 * time)) * time);
  dry[index] = sample;
}

const pcm = Buffer.alloc(frames * 4);
const delayA = Math.round(rate * .347);
const delayB = Math.round(rate * .613);
for (let index = 0; index < frames; index++) {
  const a = dry[(index - delayA + frames) % frames];
  const b = dry[(index - delayB + frames) % frames];
  const left = Math.max(-1, Math.min(1, dry[index] * .86 + a * .2 + b * .12));
  const right = Math.max(-1, Math.min(1, dry[index] * .82 + a * .12 + b * .22));
  pcm.writeInt16LE(Math.round(left * 32767), index * 4);
  pcm.writeInt16LE(Math.round(right * 32767), index * 4 + 2);
}

const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write("WAVEfmt ", 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(rate, 24);
header.writeUInt32LE(rate * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(pcm.length, 40);
fs.writeFileSync("/tmp/verbia-cosmic-lounge.wav", Buffer.concat([header, pcm]));
