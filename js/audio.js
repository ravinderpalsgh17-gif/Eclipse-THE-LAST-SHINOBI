/**
 * ECLIPSE: THE LAST SHINOBI - AUDIO & VOICE ENGINE
 * Procedural Web Audio API Synthesizer, Dynamic Music Engine,
 * 3D Positional SFX, and Live Web Speech Character Voice Synthesis.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    
    this.masterVolume = 0.85;
    this.musicVolume = 0.75;
    this.sfxVolume = 0.90;
    this.voiceEnabled = true;

    this.currentMusicTrack = null;
    this.musicTimer = null;
    this.activeTheme = 'explore'; // 'explore', 'battle', 'boss', 'eclipse'
    this.isMuted = false;

    // Pentatonic & Japanese Insen scales for procedural music
    this.scales = {
      insen: [130.81, 138.59, 164.81, 196.00, 220.00, 261.63, 277.18, 329.63, 392.00, 440.00], // C, Db, F, G, Bb
      combat: [110.00, 123.47, 130.81, 146.83, 164.81, 174.61, 196.00, 220.00], // A minor
      boss: [73.42, 82.41, 87.31, 98.00, 110.00, 123.47, 130.81] // D minor heavy
    };

    this.initAudioContext();
  }

  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    } catch (e) {
      console.warn('Web Audio API not yet allowed or supported:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  setMusicVolume(val) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
    }
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  // =========================================================================
  // SOUND EFFECTS GENERATORS (PROCEDURAL SYNTHESIS)
  // =========================================================================

  playSlash(type = 'light') {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    if (type === 'heavy') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.22);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, t);
      filter.frequency.linearRampToValueAtTime(400, t + 0.22);
      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2000, t);
      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    }

    // Add noise whoosh
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.15, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.04));
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(type === 'heavy' ? 0.45 : 0.25, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + (type === 'heavy' ? 0.22 : 0.12));

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noiseSource.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + (type === 'heavy' ? 0.22 : 0.12));
    noiseSource.start(t);
  }

  playBladeClash() {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    // High metallic strike
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2800, t);
    osc1.frequency.exponentialRampToValueAtTime(950, t + 0.18);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(4200, t);
    osc2.frequency.exponentialRampToValueAtTime(1200, t + 0.12);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.25);
    osc2.stop(t + 0.25);
  }

  playPerfectParry() {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    // Crystalline chime + sub bass shockwave
    const osc = this.ctx.createOscillator();
    const oscChime = this.ctx.createOscillator();
    const subBass = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const subGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(3200, t);
    osc.frequency.exponentialRampToValueAtTime(1600, t + 0.6);

    oscChime.type = 'sine';
    oscChime.frequency.setValueAtTime(4800, t);
    oscChime.frequency.exponentialRampToValueAtTime(2400, t + 0.5);

    subBass.type = 'sine';
    subBass.frequency.setValueAtTime(140, t);
    subBass.frequency.exponentialRampToValueAtTime(40, t + 0.4);

    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    subGain.gain.setValueAtTime(1.0, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    oscChime.connect(gain);
    gain.connect(this.sfxGain);

    subBass.connect(subGain);
    subGain.connect(this.sfxGain);

    osc.start(t);
    oscChime.start(t);
    subBass.start(t);
    osc.stop(t + 0.7);
    oscChime.stop(t + 0.7);
    subBass.stop(t + 0.4);
  }

  playDash() {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, t);
    filter.frequency.linearRampToValueAtTime(200, t + 0.18);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  playVoidWave() {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const sub = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.35);

    sub.type = 'sine';
    sub.frequency.setValueAtTime(160, t);
    sub.frequency.exponentialRampToValueAtTime(35, t + 0.4);

    gain.gain.setValueAtTime(0.85, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    sub.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    sub.start(t);
    osc.stop(t + 0.4);
    sub.stop(t + 0.4);
  }

  playThunderStep() {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    // Rapid electric pulse + thunder explosion
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.setValueAtTime(800, t + 0.05);
    osc.frequency.setValueAtTime(1500, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.35);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  playUltimate() {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    // Cataclysmic dimensional slice & explosion
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const sub = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(80, t);
    osc1.frequency.linearRampToValueAtTime(1200, t + 0.8);
    osc1.frequency.exponentialRampToValueAtTime(40, t + 1.8);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2200, t);
    osc2.frequency.exponentialRampToValueAtTime(110, t + 1.5);

    sub.type = 'sine';
    sub.frequency.setValueAtTime(90, t + 0.7);
    sub.frequency.exponentialRampToValueAtTime(25, t + 2.0);

    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.0);

    osc1.connect(gain);
    osc2.connect(gain);
    sub.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    sub.start(t + 0.7);
    osc1.stop(t + 2.0);
    osc2.stop(t + 2.0);
    sub.stop(t + 2.0);
  }

  playAwakening() {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const chord = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.6);
    osc.frequency.exponentialRampToValueAtTime(55, t + 1.5);

    chord.type = 'sine';
    chord.frequency.setValueAtTime(277.18, t);
    chord.frequency.linearRampToValueAtTime(554.37, t + 0.6);
    chord.frequency.exponentialRampToValueAtTime(110, t + 1.5);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    osc.connect(gain);
    chord.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    chord.start(t);
    osc.stop(t + 1.5);
    chord.stop(t + 1.5);
  }

  playChestOpen() {
    if (!this.ctx) return;
    this.resume();

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.35);
    });
  }

  playLevelUp() {
    if (!this.ctx) return;
    this.resume();

    const chords = [
      [261.63, 329.63, 392.00], // C
      [329.63, 392.00, 493.88], // Em
      [349.23, 440.00, 523.25], // F
      [392.00, 493.88, 587.33, 783.99] // G major flourish
    ];

    chords.forEach((chord, step) => {
      const stepTime = this.ctx.currentTime + step * 0.22;
      chord.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, stepTime);

        gain.gain.setValueAtTime(0.4, stepTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stepTime + (step === chords.length - 1 ? 0.8 : 0.25));

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(stepTime);
        osc.stop(stepTime + (step === chords.length - 1 ? 0.8 : 0.25));
      });
    });
  }

  playUiClick() {
    if (!this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.06);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  playFootstep(material = 'grass') {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    if (material === 'stone') {
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);
    } else {
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.06);
    }

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  // =========================================================================
  // DYNAMIC PROCEDURAL ORCHESTRAL MUSIC ENGINE
  // =========================================================================

  startMusic(theme = 'explore') {
    this.activeTheme = theme;
    this.stopMusic();

    let step = 0;
    const tempoMs = theme === 'battle' ? 240 : theme === 'boss' ? 200 : 420;

    this.musicTimer = setInterval(() => {
      if (!this.ctx || this.musicVolume <= 0.01) return;
      this.playMusicStep(this.activeTheme, step);
      step = (step + 1) % 32;
    }, tempoMs);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  setTheme(theme) {
    if (this.activeTheme !== theme) {
      this.startMusic(theme);
    }
  }

  playMusicStep(theme, step) {
    const t = this.ctx.currentTime;

    if (theme === 'explore') {
      // Peaceful Japanese Pentatonic (Koto / Flute arpeggio + ambient drone)
      const scale = this.scales.insen;
      const noteIdx = [0, 2, 4, 3, 5, 4, 2, 1, 0, 3, 5, 7, 6, 4, 2, 1][step % 16];
      const freq = scale[noteIdx % scale.length];

      // Koto Pluck
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(t);
      osc.stop(t + 0.6);

      // Bass pad on every 8 steps
      if (step % 8 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(scale[0] * 0.5, t);
        bassGain.gain.setValueAtTime(0.25, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);
        bassOsc.start(t);
        bassOsc.stop(t + 2.5);
      }
    } else if (theme === 'battle') {
      // High-Octane Anime Battle Theme (Drums + Arp + Bass)
      const scale = this.scales.combat;
      const arpNote = scale[(step * 3) % scale.length];

      // Synth Arp
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(arpNote * 2, t);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(t);
      osc.stop(t + 0.18);

      // Combat Drum Kick (beats 0, 4, 8, 12)
      if (step % 4 === 0) {
        const kick = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(140, t);
        kick.frequency.exponentialRampToValueAtTime(30, t + 0.15);
        kickGain.gain.setValueAtTime(0.4, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        kick.connect(kickGain);
        kickGain.connect(this.musicGain);
        kick.start(t);
        kick.stop(t + 0.15);
      }

      // Snare / Taiko rim (beats 2, 6, 10, 14)
      if (step % 4 === 2) {
        const snare = this.ctx.createOscillator();
        const snareGain = this.ctx.createGain();
        snare.type = 'triangle';
        snare.frequency.setValueAtTime(350, t);
        snare.frequency.exponentialRampToValueAtTime(80, t + 0.1);
        snareGain.gain.setValueAtTime(0.25, t);
        snareGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        snare.connect(snareGain);
        snareGain.connect(this.musicGain);
        snare.start(t);
        snare.stop(t + 0.1);
      }
    } else if (theme === 'boss') {
      // Epic Dark Apocalyptic Choir & Thundering Brass
      const scale = this.scales.boss;
      const note = scale[(step * 2) % scale.length];

      const osc = this.ctx.createOscillator();
      const choir = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note, t);
      choir.type = 'sine';
      choir.frequency.setValueAtTime(note * 1.5, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      choir.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      choir.start(t);
      osc.stop(t + 0.35);
      choir.stop(t + 0.35);

      // Massive sub-impact
      if (step % 8 === 0) {
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(80, t);
        sub.frequency.exponentialRampToValueAtTime(20, t + 0.5);
        subGain.gain.setValueAtTime(0.6, t);
        subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

        sub.connect(subGain);
        subGain.connect(this.musicGain);
        sub.start(t);
        sub.stop(t + 0.5);
      }
    }
  }
}

// =========================================================================
// CHARACTER VOICE SYNTHESIS ENGINE (WEB SPEECH API)
// =========================================================================

class VoiceEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.enabled = true;
    this.voices = [];
    this.isSpeaking = false;

    if (this.synth) {
      this.loadVoices();
      if (typeof this.synth.onvoiceschanged !== 'undefined') {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  speak(text, character = 'ren', onEndCallback = null) {
    if (!this.synth || !this.enabled || !text) {
      if (onEndCallback) onEndCallback();
      return;
    }

    try {
      this.synth.cancel(); // cancel pending utterances for crisp responsive lines

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Profiles for each canonical character
      let pitch = 1.0;
      let rate = 1.0;
      let preferredLang = 'en-US';

      switch (character.toLowerCase()) {
        case 'ren':
          pitch = 1.05;
          rate = 1.05;
          break;
        case 'ayame':
          pitch = 1.35;
          rate = 1.15;
          break;
        case 'kaito':
          pitch = 0.80;
          rate = 0.95;
          break;
        case 'kurogane':
          pitch = 0.60;
          rate = 0.85;
          break;
        case 'malakor':
          pitch = 0.45;
          rate = 0.75;
          break;
        case 'elder':
        case 'genzo':
          pitch = 0.80;
          rate = 0.88;
          break;
        case 'saki':
          pitch = 1.25;
          rate = 1.0;
          break;
        default:
          pitch = 1.0;
          rate = 1.0;
      }

      utterance.pitch = pitch;
      utterance.rate = rate;

      // Select suitable English voice
      if (this.voices.length > 0) {
        const voice = this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
        if (voice) utterance.voice = voice;
      }

      this.isSpeaking = true;

      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEndCallback) onEndCallback();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        if (onEndCallback) onEndCallback();
      };

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      if (onEndCallback) onEndCallback();
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }
}

// Global instances
window.soundEngine = new SoundEngine();
window.voiceEngine = new VoiceEngine();
