/**
 * TEM Edit - Multi-Track Timeline Component
 * Manages visual tracks for Video, Audio, and Text layers, playhead scrubbing,
 * clip trimming handles, clip splitting, selection, and zoom scale.
 */

export class Timeline {
  constructor(containerElement) {
    this.container = containerElement;
    this.clips = [];
    this.audioClips = [];
    this.textLayers = [];
    
    this.currentTime = 0;
    this.totalDuration = 10; // Default 10s until video loads
    this.pxPerSecond = 20;   // Zoom level
    this.selectedClipId = null;

    this.onSeekCallback = null;
    this.onClipSelectCallback = null;
    this.onClipTrimCallback = null;

    this.isScrubbing = false;

    this.render();
    this.bindEvents();
  }

  setDuration(duration) {
    if (duration > 0) {
      this.totalDuration = duration;
      this.render();
    }
  }

  setClips(clips) {
    this.clips = clips;
    this.render();
  }

  setTextLayers(textLayers) {
    this.textLayers = textLayers;
    this.render();
  }

  setCurrentTime(time) {
    this.currentTime = Math.max(0, Math.min(this.totalDuration, time));
    this.updatePlayheadPosition();
  }

  setZoom(pxPerSec) {
    this.pxPerSecond = Math.max(5, Math.min(100, pxPerSec));
    this.render();
  }

  render() {
    if (!this.container) return;

    const timelineWidth = Math.max(this.container.clientWidth || 800, this.totalDuration * this.pxPerSecond + 100);

    const formattedCurrent = this.formatTime(this.currentTime);
    const formattedTotal = this.formatTime(this.totalDuration);

    this.container.innerHTML = `
      <div class="timeline-header">
        <div class="timeline-controls-left">
          <button id="tl-btn-play" class="btn btn-icon btn-primary" title="Play/Pause">
            <span class="icon">▶</span>
          </button>
          <button id="tl-btn-rewind" class="btn btn-icon btn-secondary" title="Rewind to start">
            <span class="icon">⏮</span>
          </button>
          <button id="tl-btn-split" class="btn btn-sm btn-secondary" title="Split Clip at Cursor">
            ✂️ <span data-i18n="tab_split">Split</span>
          </button>
          <div class="timeline-time-display">
            <span id="tl-time-current">${formattedCurrent}</span> / <span id="tl-time-total">${formattedTotal}</span>
          </div>
        </div>

        <div class="timeline-controls-right">
          <button id="tl-btn-zoom-out" class="btn btn-icon btn-secondary" title="Zoom Out">-</button>
          <span class="zoom-label">Zoom</span>
          <button id="tl-btn-zoom-in" class="btn btn-icon btn-secondary" title="Zoom In">+</button>
        </div>
      </div>

      <div class="timeline-body-scroll" id="tl-body-scroll">
        <div class="timeline-tracks-wrapper" style="width: ${timelineWidth}px;">
          
          <!-- Ruler Track -->
          <div class="timeline-ruler" id="tl-ruler">
            ${this.renderRulerTicks(timelineWidth)}
          </div>

          <!-- Playhead Scrub Line -->
          <div class="timeline-playhead" id="tl-playhead">
            <div class="playhead-head"></div>
            <div class="playhead-line"></div>
          </div>

          <!-- Video Track -->
          <div class="timeline-track track-video">
            <div class="track-label"><span class="icon">🎬</span> <span data-i18n="track_video">Video</span></div>
            <div class="track-content">
              ${this.clips.map((clip, idx) => this.renderClipBlock(clip, idx)).join('')}
            </div>
          </div>

          <!-- Audio Track -->
          <div class="timeline-track track-audio">
            <div class="track-label"><span class="icon">🎵</span> <span data-i18n="track_audio">Audio</span></div>
            <div class="track-content">
              <div class="clip-block audio-block" style="left: 0px; width: ${this.totalDuration * this.pxPerSecond}px;">
                <span class="clip-title">Original Audio</span>
              </div>
            </div>
          </div>

            <!-- Text Layers Track -->
            <div class="timeline-track track-text">
              <div class="track-label"><span class="icon">📝</span> <span data-i18n="track_text">Text</span></div>
              <div class="track-content">
                ${this.textLayers.map((txt) => `
                  <div class="clip-block text-block ${txt.id === this.selectedTextId ? 'selected' : ''}" 
                       data-text-id="${txt.id}"
                       style="left: ${(txt.startTime || 0) * this.pxPerSecond}px; width: ${(txt.duration || 5) * this.pxPerSecond}px;">
                    <span class="clip-title">Text: ${txt.text || 'Text Layer'}</span>
                  </div>
                `).join('')}
              </div>
            </div>

        </div>
      </div>
    `;

    this.updatePlayheadPosition();
    this.rebindDynamicEvents();
  }

  renderRulerTicks(width) {
    let ticksHTML = '';
    const stepSeconds = this.pxPerSecond > 40 ? 1 : (this.pxPerSecond > 15 ? 5 : 10);
    const totalTicks = Math.ceil(this.totalDuration / stepSeconds);

    for (let i = 0; i <= totalTicks; i++) {
      const sec = i * stepSeconds;
      const leftPx = sec * this.pxPerSecond;
      ticksHTML += `
        <div class="ruler-tick" style="left: ${leftPx}px;">
          <span class="tick-label">${this.formatTime(sec, false)}</span>
        </div>
      `;
    }
    return ticksHTML;
  }

  renderClipBlock(clip, index) {
    const leftPx = (clip.timelineStart || 0) * this.pxPerSecond;
    const widthPx = (clip.duration || (clip.endTime - clip.startTime)) * this.pxPerSecond;
    const isSelected = clip.id === this.selectedClipId ? 'selected' : '';

    return `
      <div class="clip-block video-block ${isSelected}" 
           data-clip-id="${clip.id}" 
           data-clip-idx="${index}"
           style="left: ${leftPx}px; width: ${Math.max(10, widthPx)}px;">
        <div class="trim-handle trim-handle-left" data-handle="left"></div>
        <div class="clip-info">
          <span class="clip-title">${clip.name || `Clip ${index + 1}`}</span>
          <span class="clip-duration">${(clip.endTime - clip.startTime).toFixed(1)}s</span>
        </div>
        <div class="trim-handle trim-handle-right" data-handle="right"></div>
      </div>
    `;
  }

  updatePlayheadPosition() {
    const playheadEl = document.getElementById('tl-playhead');
    const currentDisplay = document.getElementById('tl-time-current');
    if (playheadEl) {
      const leftPx = this.currentTime * this.pxPerSecond;
      playheadEl.style.left = `${leftPx}px`;
    }
    if (currentDisplay) {
      currentDisplay.textContent = this.formatTime(this.currentTime);
    }
  }

  bindEvents() {
    document.addEventListener('pointerdown', (e) => {
      const scrollArea = document.getElementById('tl-body-scroll');
      if (scrollArea && scrollArea.contains(e.target)) {
        this.isScrubbing = true;
        this.handleTimelinePointer(e);
      }
    });

    document.addEventListener('pointermove', (e) => {
      if (this.isScrubbing) {
        this.handleTimelinePointer(e);
      }
    });

    document.addEventListener('pointerup', () => {
      this.isScrubbing = false;
    });
  }

  rebindDynamicEvents() {
    const zoomInBtn = document.getElementById('tl-btn-zoom-in');
    const zoomOutBtn = document.getElementById('tl-btn-zoom-out');
    const rewindBtn = document.getElementById('tl-btn-rewind');
    const playBtn = document.getElementById('tl-btn-play');

    if (zoomInBtn) zoomInBtn.onclick = () => this.setZoom(this.pxPerSecond + 10);
    if (zoomOutBtn) zoomOutBtn.onclick = () => this.setZoom(this.pxPerSecond - 10);
    if (rewindBtn) rewindBtn.onclick = () => {
      this.setCurrentTime(0);
      if (this.onSeekCallback) this.onSeekCallback(0);
    };

    if (playBtn) {
      playBtn.onclick = () => {
        const mainPlayBtn = document.getElementById('btn-play-pause');
        if (mainPlayBtn) mainPlayBtn.click();
      };
    }

    const clipBlocks = this.container.querySelectorAll('.clip-block.video-block');
    clipBlocks.forEach((block) => {
      block.onclick = () => {
        const id = block.getAttribute('data-clip-id');
        this.selectedClipId = id;
        this.render();
        if (this.onClipSelectCallback) this.onClipSelectCallback(id);
      };
    });

    const textBlocks = this.container.querySelectorAll('.clip-block.text-block');
    textBlocks.forEach((block) => {
      block.onclick = (e) => {
        e.stopPropagation();
        const id = block.getAttribute('data-text-id');
        this.selectedTextId = id;
        this.render();
        if (this.onTextSelectCallback) this.onTextSelectCallback(id);
      };
    });
  }

  handleTimelinePointer(e) {
    const tracksWrapper = this.container.querySelector('.timeline-tracks-wrapper');
    if (!tracksWrapper) return;
    
    const rect = tracksWrapper.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekTime = Math.max(0, Math.min(this.totalDuration, clickX / this.pxPerSecond));
    
    this.setCurrentTime(seekTime);
    if (this.onSeekCallback) {
      this.onSeekCallback(seekTime);
    }
  }

  formatTime(seconds, includeSubseconds = true) {
    const secs = Math.floor(seconds || 0);
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    const ms = Math.floor((seconds % 1) * 10);

    const pad = (n) => (n < 10 ? '0' + n : n);
    if (includeSubseconds) {
      return `${pad(mins)}:${pad(remainingSecs)}.${ms}`;
    }
    return `${pad(mins)}:${pad(remainingSecs)}`;
  }
}
