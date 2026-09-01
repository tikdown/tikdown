/**
 * TEM Edit - Primary Video Editor Core Engine
 * Manages video clip composition, canvas rendering loop, visual filters, 
 * upscaling, text layer positioning, and watermark mask integration.
 */

import { audioEngine } from './audioEngine.js';
import { watermarkRemover } from './watermark.js';

export class VideoEditor {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    this.clips = [];
    this.activeClipIndex = 0;
    
    this.isPlaying = false;
    this.currentTime = 0;
    this.animationFrameId = null;

    // Filters state
    this.filters = {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      sharpness: 0,
      resolutionScale: 'original'
    };

    // Subtle brand watermark text layer (Small, Bottom-Left)
    this.textLayers = [
      {
        id: 'txt_1',
        text: 'TEM EDIT',
        fontFamily: 'Cairo, sans-serif',
        fontSize: 20,
        color: 'rgba(255, 255, 255, 0.85)',
        bgColor: 'rgba(0, 0, 0, 0.35)',
        strokeColor: 'transparent',
        x: 0.12, // Bottom Left Corner
        y: 0.92,
        startTime: 0,
        duration: 10
      }
    ];
    this.selectedTextId = 'txt_1';

    // Canvas sizing defaults
    this.canvas.width = 1280;
    this.canvas.height = 720;

    this.onTimeUpdateCallback = null;
    this.onEndedCallback = null;

    this.bindCanvasInteraction();
  }

  addVideoClip(file) {
    return new Promise((resolve, reject) => {
      const videoEl = document.createElement('video');
      videoEl.crossOrigin = 'anonymous';
      videoEl.preload = 'auto';
      videoEl.src = URL.createObjectURL(file);

      videoEl.onloadedmetadata = () => {
        const duration = videoEl.duration;
        const clip = {
          id: 'clip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          name: file.name,
          file: file,
          videoElement: videoEl,
          startTime: 0,
          endTime: duration,
          duration: duration,
          originalWidth: videoEl.videoWidth,
          originalHeight: videoEl.videoHeight
        };

        this.clips.push(clip);

        // Adjust canvas resolution to match first video aspect ratio
        if (this.clips.length === 1) {
          this.canvas.width = videoEl.videoWidth || 1280;
          this.canvas.height = videoEl.videoHeight || 720;
          audioEngine.connectVideoElement(videoEl);
        }

        this.renderCurrentFrame();
        resolve(clip);
      };

      videoEl.onerror = (err) => reject(err);
    });
  }

  getCurrentClip() {
    return this.clips[this.activeClipIndex] || null;
  }

  getTotalDuration() {
    return this.clips.reduce((acc, c) => acc + (c.endTime - c.startTime), 0);
  }

  play() {
    const clip = this.getCurrentClip();
    if (!clip || !clip.videoElement) return;

    this.isPlaying = true;
    audioEngine.ensureContext();
    clip.videoElement.play();
    audioEngine.playMusic(this.currentTime);

    this.startRenderLoop();
  }

  pause() {
    const clip = this.getCurrentClip();
    if (clip && clip.videoElement) {
      clip.videoElement.pause();
    }
    audioEngine.pauseMusic();
    this.isPlaying = false;
    this.stopRenderLoop();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  seekTo(time) {
    this.currentTime = Math.max(0, Math.min(this.getTotalDuration(), time));
    const clip = this.getCurrentClip();

    if (clip && clip.videoElement) {
      // Map global timeline time to active clip relative time
      const targetTime = clip.startTime + this.currentTime;
      clip.videoElement.currentTime = targetTime;
    }

    this.renderCurrentFrame();
  }

  trimActiveClip(startTime, endTime) {
    const clip = this.getCurrentClip();
    if (!clip) return;

    clip.startTime = Math.max(0, parseFloat(startTime));
    clip.endTime = Math.min(clip.duration, parseFloat(endTime));
    if (clip.endTime <= clip.startTime) {
      clip.endTime = clip.startTime + 0.5;
    }

    this.seekTo(0);
  }

  splitClipAt(splitTime) {
    const clip = this.getCurrentClip();
    if (!clip) return null;

    const relativeSplit = clip.startTime + splitTime;
    if (relativeSplit <= clip.startTime || relativeSplit >= clip.endTime) return null;

    // Create second segment
    const clip2 = {
      ...clip,
      id: 'clip_' + Date.now(),
      name: clip.name + ' (Part 2)',
      startTime: relativeSplit,
      endTime: clip.endTime
    };

    // Trim first segment
    clip.endTime = relativeSplit;

    // Insert clip2 after clip1
    this.clips.splice(this.activeClipIndex + 1, 0, clip2);
    return clip2;
  }

  setFilter(filterName, value) {
    if (this.filters.hasOwnProperty(filterName)) {
      this.filters[filterName] = value;
      this.renderCurrentFrame();
    }
  }

  resetFilters() {
    this.filters = {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      sharpness: 0,
      resolutionScale: 'original'
    };
    this.renderCurrentFrame();
  }

  addTextLayer(text = 'New Text') {
    const layer = {
      id: 'txt_' + Date.now(),
      text: text,
      fontFamily: 'Cairo, sans-serif',
      fontSize: 42,
      color: '#ffffff',
      bgColor: 'transparent',
      strokeColor: '#000000',
      x: 0.5,
      y: 0.5,
      startTime: 0,
      duration: this.getTotalDuration() || 10
    };
    this.textLayers.push(layer);
    this.selectedTextId = layer.id;
    this.renderCurrentFrame();
    return layer;
  }

  updateSelectedTextLayer(props) {
    const layer = this.textLayers.find((t) => t.id === this.selectedTextId);
    if (layer) {
      Object.assign(layer, props);
      this.renderCurrentFrame();
    }
  }

  deleteSelectedTextLayer() {
    if (!this.selectedTextId) return false;
    const index = this.textLayers.findIndex((t) => t.id === this.selectedTextId);
    if (index !== -1) {
      this.textLayers.splice(index, 1);
      this.selectedTextId = this.textLayers.length > 0 ? this.textLayers[0].id : null;
      this.renderCurrentFrame();
      return true;
    }
    return false;
  }

  startRenderLoop() {
    const loop = () => {
      if (!this.isPlaying) return;

      const clip = this.getCurrentClip();
      if (clip && clip.videoElement) {
        this.currentTime = clip.videoElement.currentTime - clip.startTime;

        // Check if clip reached end marker
        if (clip.videoElement.currentTime >= clip.endTime || clip.videoElement.ended) {
          clip.videoElement.pause();
          this.isPlaying = false;
          if (this.onEndedCallback) this.onEndedCallback();
          return;
        }

        if (this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(this.currentTime);
        }
      }

      this.renderCurrentFrame();
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  stopRenderLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  renderCurrentFrame() {
    const clip = this.getCurrentClip();
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear canvas background
    this.ctx.fillStyle = '#0a0c10';
    this.ctx.fillRect(0, 0, w, h);

    if (clip && clip.videoElement && clip.videoElement.readyState >= 2) {
      this.ctx.save();

      // Step 1: Apply Video Color Filters
      const brightnessStr = `brightness(${this.filters.brightness}%)`;
      const contrastStr = `contrast(${this.filters.contrast}%)`;
      const saturateStr = `saturate(${this.filters.saturation}%)`;
      this.ctx.filter = `${brightnessStr} ${contrastStr} ${saturateStr}`;

      // Step 2: Draw video frame onto canvas
      this.ctx.drawImage(clip.videoElement, 0, 0, w, h);
      this.ctx.restore();

      // Step 3: Apply Sharpness matrix filter if enabled
      if (this.filters.sharpness > 0) {
        this.applySharpnessFilter(w, h, this.filters.sharpness / 100);
      }

      // Step 4: Watermark Clean Filter Pass
      watermarkRemover.applyCleanFilter(this.ctx, w, h);

      // Step 5: Render Text Layers
      this.renderTextLayers(w, h);

      // Step 6: Draw Watermark Selection ROI overlay if active
      watermarkRemover.drawOverlay(this.ctx, w, h);
    } else {
      // Empty Canvas state placeholder
      this.ctx.fillStyle = '#718096';
      this.ctx.font = '20px Cairo, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('ارفع فيديو للبدء في المونتاج | Upload a video to start editing', w / 2, h / 2);
    }
  }

  applySharpnessFilter(w, h, amount) {
    try {
      const imageData = this.ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const mix = amount * 0.5;

      // 3x3 Sharpen Kernel
      for (let i = w * 4; i < data.length - w * 4; i += 4) {
        const center = data[i];
        const left = data[i - 4];
        const right = data[i + 4];
        const top = data[i - w * 4];
        const bottom = data[i + w * 4];

        const sharpened = center * 5 - (left + right + top + bottom);
        data[i] = center * (1 - mix) + sharpened * mix;
      }
      this.ctx.putImageData(imageData, 0, 0);
    } catch (e) {
      console.warn('Canvas filter notice:', e);
    }
  }

  renderTextLayers(w, h) {
    this.textLayers.forEach((layer) => {
      const startTime = layer.startTime || 0;
      const duration = layer.duration || 5;

      // Check visibility window
      if (this.currentTime < startTime || this.currentTime > (startTime + duration)) return;

      const elapsed = this.currentTime - startTime;
      let tx = layer.x * w;
      let ty = layer.y * h;
      let textToDraw = layer.text;
      let alpha = 1.0;
      let scale = 1.0;

      // Apply Animations
      const anim = layer.animation || 'none';

      if (anim === 'fade') {
        const fadeIn = Math.min(1, elapsed / 0.5);
        const fadeOut = Math.min(1, (startTime + duration - this.currentTime) / 0.5);
        alpha = Math.min(fadeIn, fadeOut);
      } else if (anim === 'typewriter') {
        const progress = Math.min(1, elapsed / (duration * 0.5));
        const charCount = Math.ceil(layer.text.length * progress);
        textToDraw = layer.text.substring(0, charCount);
      } else if (anim === 'bounce') {
        if (elapsed < 0.6) {
          const bounceProgress = elapsed / 0.6;
          scale = 0.5 + 0.6 * Math.sin(bounceProgress * Math.PI);
        }
      } else if (anim === 'slide_up') {
        if (elapsed < 0.5) {
          const slideProgress = 1 - (elapsed / 0.5);
          ty += slideProgress * 40;
        }
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

      if (scale !== 1.0) {
        this.ctx.translate(tx, ty);
        this.ctx.scale(scale, scale);
        this.ctx.translate(-tx, -ty);
      }

      if (anim === 'glow_pulse') {
        this.ctx.shadowColor = layer.strokeColor || '#00f2fe';
        this.ctx.shadowBlur = 12 + 10 * Math.sin(elapsed * 5);
      }

      this.ctx.font = `bold ${layer.fontSize}px ${layer.fontFamily}`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';

      const metrics = this.ctx.measureText(textToDraw || ' ');
      const textWidth = metrics.width;
      const textHeight = layer.fontSize * 1.2;

      if (layer.bgColor && layer.bgColor !== 'transparent') {
        this.ctx.fillStyle = layer.bgColor;
        this.ctx.fillRect(tx - textWidth / 2 - 8, ty - textHeight / 2 - 4, textWidth + 16, textHeight + 8);
      }

      this.ctx.fillStyle = layer.color;
      this.ctx.fillText(textToDraw, tx, ty);

      if (layer.id === this.selectedTextId) {
        this.ctx.strokeStyle = '#00e676';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(tx - textWidth / 2 - 16, ty - textHeight / 2 - 8, textWidth + 32, textHeight + 16);
      }

      this.ctx.restore();
    });
  }

  bindCanvasInteraction() {
    let isDraggingText = false;
    let dragStartX = 0;
    let dragStartY = 0;

    this.canvas.addEventListener('pointerdown', (e) => {
      // First try watermark ROI selection handle
      const handledByWatermark = watermarkRemover.handleMouseDown(e, this.canvas);
      if (handledByWatermark) {
        this.renderCurrentFrame();
        return;
      }

      // Otherwise check text layer click
      const rect = this.canvas.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) / rect.width;
      const clickY = (e.clientY - rect.top) / rect.height;

      const layer = this.textLayers.find((l) => l.id === this.selectedTextId);
      if (layer) {
        const dist = Math.hypot(clickX - layer.x, clickY - layer.y);
        if (dist < 0.15) {
          isDraggingText = true;
          dragStartX = clickX - layer.x;
          dragStartY = clickY - layer.y;
        }
      }
    });

    this.canvas.addEventListener('pointermove', (e) => {
      watermarkRemover.handleMouseMove(e, this.canvas);
      if (watermarkRemover.enabled) {
        this.renderCurrentFrame();
        return;
      }

      if (isDraggingText) {
        const rect = this.canvas.getBoundingClientRect();
        const currentX = (e.clientX - rect.left) / rect.width;
        const currentY = (e.clientY - rect.top) / rect.height;

        const layer = this.textLayers.find((l) => l.id === this.selectedTextId);
        if (layer) {
          layer.x = Math.max(0.05, Math.min(0.95, currentX - dragStartX));
          layer.y = Math.max(0.05, Math.min(0.95, currentY - dragStartY));
          this.renderCurrentFrame();
        }
      }
    });

    document.addEventListener('pointerup', () => {
      isDraggingText = false;
      watermarkRemover.handleMouseUp();
    });
  }
}
