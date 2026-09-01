/**
 * TEM Edit - Web Audio Engine
 * Handles audio graph construction, volume, mute, background music mixing, 
 * noise filtering (highpass/lowpass), and vocal compression via Web Audio API.
 */

class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.videoSourceNode = null;
    this.masterGainNode = null;
    
    // Noise cleanup filters
    this.highPassFilter = null;
    this.lowPassFilter = null;
    this.compressor = null;
    
    // Background Music
    this.musicAudio = new Audio();
    this.musicSourceNode = null;
    this.musicGainNode = null;
    
    // Destination for export recording
    this.mediaStreamDestination = null;
    
    this.isMuted = false;
    this.lastVolume = 1.0;
    this.currentNoiseMode = 'off';
    this.isVocalBoostEnabled = false;
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      this.mediaStreamDestination = this.audioCtx.createMediaStreamDestination();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  connectVideoElement(videoElement) {
    this.ensureContext();
    if (this.videoSourceNode) return; // Already connected

    try {
      this.videoSourceNode = this.audioCtx.createMediaElementSource(videoElement);
      
      // Gain node for video volume
      this.masterGainNode = this.audioCtx.createGain();
      
      // Highpass filter (cuts sub-bass rumble/wind below 100Hz)
      this.highPassFilter = this.audioCtx.createBiquadFilter();
      this.highPassFilter.type = 'highpass';
      this.highPassFilter.frequency.value = 20; // Default bypassed
      
      // Lowpass filter (cuts high hiss above 12kHz)
      this.lowPassFilter = this.audioCtx.createBiquadFilter();
      this.lowPassFilter.type = 'lowpass';
      this.lowPassFilter.frequency.value = 20000; // Default bypassed

      // Dynamics Compressor (Vocal clarity & leveling)
      this.compressor = this.audioCtx.createDynamicsCompressor();
      this.compressor.threshold.value = -24;
      this.compressor.knee.value = 30;
      this.compressor.ratio.value = 4;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.25;

      // Connect video chain: videoSource -> highpass -> lowpass -> compressor -> masterGain
      this.videoSourceNode.connect(this.highPassFilter);
      this.highPassFilter.connect(this.lowPassFilter);
      this.lowPassFilter.connect(this.compressor);
      this.compressor.connect(this.masterGainNode);

      // Connect to speakers AND stream destination for recording
      this.masterGainNode.connect(this.audioCtx.destination);
      this.masterGainNode.connect(this.mediaStreamDestination);
    } catch (err) {
      console.warn('Audio node connection notice:', err);
    }
  }

  setVolume(level) {
    if (!this.masterGainNode) return;
    this.lastVolume = parseFloat(level);
    if (!this.isMuted) {
      this.masterGainNode.gain.value = this.lastVolume;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = this.isMuted ? 0 : this.lastVolume;
    }
    return this.isMuted;
  }

  setNoiseFilterMode(mode) {
    this.currentNoiseMode = mode;
    if (!this.highPassFilter || !this.lowPassFilter) return;

    switch (mode) {
      case 'light':
        // Cut low hum below 80Hz, cut high hiss above 10kHz
        this.highPassFilter.frequency.value = 80;
        this.lowPassFilter.frequency.value = 10000;
        break;
      case 'medium':
        // Cut low hum below 150Hz, cut high hiss above 7000Hz
        this.highPassFilter.frequency.value = 150;
        this.lowPassFilter.frequency.value = 7000;
        break;
      case 'strong':
        // Vocal focus: cut below 250Hz, cut above 4500Hz
        this.highPassFilter.frequency.value = 250;
        this.lowPassFilter.frequency.value = 4500;
        break;
      case 'off':
      default:
        this.highPassFilter.frequency.value = 20;
        this.lowPassFilter.frequency.value = 20000;
        break;
    }
  }

  setVocalBoost(enabled) {
    this.isVocalBoostEnabled = enabled;
    if (!this.compressor) return;
    if (enabled) {
      this.compressor.ratio.value = 8;
      this.compressor.threshold.value = -18;
    } else {
      this.compressor.ratio.value = 4;
      this.compressor.threshold.value = -24;
    }
  }

  loadBackgroundMusic(file) {
    this.ensureContext();
    const url = URL.createObjectURL(file);
    this.musicAudio.src = url;
    this.musicAudio.crossOrigin = 'anonymous';

    if (!this.musicSourceNode) {
      try {
        this.musicSourceNode = this.audioCtx.createMediaElementSource(this.musicAudio);
        this.musicGainNode = this.audioCtx.createGain();
        this.musicGainNode.gain.value = 0.5; // Default 50%

        this.musicSourceNode.connect(this.musicGainNode);
        this.musicGainNode.connect(this.audioCtx.destination);
        this.musicGainNode.connect(this.mediaStreamDestination);
      } catch (e) {
        console.warn('Music node connection notice:', e);
      }
    }
  }

  playMusic(currentTime = 0) {
    if (this.musicAudio.src) {
      this.musicAudio.currentTime = currentTime;
      this.musicAudio.play().catch(() => {});
    }
  }

  pauseMusic() {
    if (this.musicAudio.src) {
      this.musicAudio.pause();
    }
  }

  setMusicVolume(level) {
    if (this.musicGainNode) {
      this.musicGainNode.gain.value = parseFloat(level);
    }
  }

  setMusicLoop(loop) {
    this.musicAudio.loop = !!loop;
  }

  removeMusic() {
    this.musicAudio.pause();
    this.musicAudio.removeAttribute('src');
    this.musicAudio.load();
  }

  getAudioStreamTrack() {
    if (this.mediaStreamDestination && this.mediaStreamDestination.stream) {
      const tracks = this.mediaStreamDestination.stream.getAudioTracks();
      if (tracks.length > 0) return tracks[0];
    }
    return null;
  }
}

export const audioEngine = new AudioEngine();
