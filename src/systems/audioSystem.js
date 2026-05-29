export class AudioSystem {
  constructor() {
    this.context = null;
    this.master = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.ambientGain = null;
    this.currentTrackId = null;
    this.currentAmbienceId = null;
    this.oscillators = [];
    this.ambienceNodes = [];
    this.enabled = false;
    this.settings = {
      music: true,
      sfx: true,
      muted: false,
      musicVolume: 0.32,
      sfxVolume: 0.45,
      ambienceVolume: 0.2
    };
  }

  unlock(settings = this.settings) {
    this.settings = { ...this.settings, ...settings };
    if (!window.AudioContext && !window.webkitAudioContext) return;
    if (!this.context) {
      const Context = window.AudioContext || window.webkitAudioContext;
      this.context = new Context();
      this.master = this.context.createGain();
      this.musicGain = this.context.createGain();
      this.sfxGain = this.context.createGain();
      this.ambientGain = this.context.createGain();
      this.musicGain.connect(this.master);
      this.sfxGain.connect(this.master);
      this.ambientGain.connect(this.master);
      this.master.connect(this.context.destination);
    }
    this.enabled = true;
    this.context.resume?.();
    this.applySettings(settings);
  }

  applySettings(settings = this.settings) {
    this.settings = { ...this.settings, ...settings };
    if (!this.context) return;
    this.master.gain.value = this.settings.muted ? 0 : 1;
    this.musicGain.gain.value = this.settings.music ? this.settings.musicVolume : 0;
    this.sfxGain.gain.value = this.settings.sfx ? this.settings.sfxVolume : 0;
    this.ambientGain.gain.value = this.settings.music ? this.settings.ambienceVolume ?? 0.2 : 0;
  }

  stopMusic() {
    for (const oscillator of this.oscillators) {
      try {
        oscillator.stop();
      } catch {
        // Already stopped.
      }
    }
    this.oscillators = [];
    this.currentTrackId = null;
  }

  stopAmbience() {
    for (const node of this.ambienceNodes) {
      try {
        node.stop();
      } catch {
        // Already stopped.
      }
    }
    this.ambienceNodes = [];
    this.currentAmbienceId = null;
  }

  playMusic(track) {
    if (!track || !this.enabled || !this.context || !this.settings.music) return;
    if (this.currentTrackId === track.id) return;

    this.stopMusic();
    this.currentTrackId = track.id;

    const now = this.context.currentTime;
    const tempoScale = Math.max(0.7, Math.min(1.4, (track.tempo ?? 72) / 72));
    const chord = track.chords ?? [261.63, 329.63, 392.0];

    chord.forEach((frequency, index) => {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency / (index === 0 ? 2 : 1);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.045 / (index + 1), now + 1.5);
      gain.gain.setTargetAtTime(0.025 / (index + 1), now + 2.2 / tempoScale, 2.8);
      oscillator.connect(gain);
      gain.connect(this.musicGain);
      oscillator.start(now + index * 0.08);
      this.oscillators.push(oscillator);
    });
  }

  playAmbience(type = null) {
    if (!type) {
      this.stopAmbience();
      return;
    }
    if (!this.enabled || !this.context || !this.settings.music || this.settings.muted) return;
    if (this.currentAmbienceId === type) return;

    this.stopAmbience();
    this.currentAmbienceId = type;

    const now = this.context.currentTime;
    const presets = {
      "school-hall": [174.61, 220.0],
      "school-night": [146.83, 196.0],
      wind: [98.0, 146.83],
      library: [130.81, 164.81],
      rain: [116.54, 174.61]
    };
    const frequencies = presets[type] ?? presets["school-hall"];

    frequencies.forEach((frequency, index) => {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.018 / (index + 1), now + 1.2);
      oscillator.connect(gain);
      gain.connect(this.ambientGain);
      oscillator.start(now + index * 0.05);
      this.ambienceNodes.push(oscillator);
    });
  }

  playSfx(type = "click") {
    if (!this.enabled || !this.context || !this.settings.sfx || this.settings.muted) return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const preset = {
      click: [520, "sine", 0.14],
      choice: [660, "triangle", 0.18],
      success: [880, "sine", 0.24],
      warning: [180, "sawtooth", 0.22],
      page: [420, "sine", 0.16],
      menu: [360, "triangle", 0.16],
      coin: [760, "triangle", 0.18],
      heart: [620, "sine", 0.26],
      notification: [940, "sine", 0.22],
      door: [120, "triangle", 0.28],
      bell: [1046.5, "sine", 0.42],
      save: [700, "triangle", 0.18]
    }[type] ?? [520, "sine", 0.14];
    const [frequency, wave, duration] = preset;

    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(90, frequency * 0.58), now + duration * 0.66);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.sfxGain);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }
}
