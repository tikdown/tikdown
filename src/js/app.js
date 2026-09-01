/**
 * TEM Edit - Main Application Entry Point
 * Binds UI interactions, event listeners, tool tabs, timeline sync, 
 * export engine triggers, and notifications.
 */

import { toggleLang, setLang, t, updateDOMTranslations } from './i18n.js';
import { VideoEditor } from './editor.js';
import { Timeline } from './timeline.js';
import { audioEngine } from './audioEngine.js';
import { watermarkRemover } from './watermark.js';
import { ExportEngine } from './exportEngine.js';
import { initModals, openModal, closeModal } from './modals.js';
import { initAds } from './ads.js';

let editor = null;
let timeline = null;
let exportEngine = null;

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // 1. Initialize Canvas & Video Editor Engine
  const canvasEl = document.getElementById('preview-canvas');
  if (!canvasEl) return;

  editor = new VideoEditor(canvasEl);
  exportEngine = new ExportEngine(editor);

  // 2. Initialize Timeline Component
  const timelineContainer = document.getElementById('timeline-container');
  timeline = new Timeline(timelineContainer);

  // 3. Connect Editor and Timeline Callbacks
  editor.onTimeUpdateCallback = (currentTime) => {
    timeline.setCurrentTime(currentTime);
  };

  editor.onEndedCallback = () => {
    timeline.setCurrentTime(0);
    showToast(t('export_complete'), 'info');
  };

  timeline.onSeekCallback = (seekTime) => {
    editor.seekTo(seekTime);
  };

  timeline.onClipSelectCallback = (clipId) => {
    // Sync active clip
  };

  // 4. Initialize Modals & Ad Slots
  initModals();
  initAds();
  setLang('ar'); // Default to Arabic RTL

  // 5. Bind User Interactions
  bindHeaderEvents();
  bindUploadEvents();
  bindPlaybackEvents();
  bindToolTabs();
  bindTrimTool();
  bindSplitTool();
  bindMergeTool();
  bindEnhanceTool();
  bindAudioTool();
  bindTextTool();
  bindMusicTool();
  bindWatermarkTool();
  bindExportEvents();

  console.log('TEM Edit initialized successfully.');
}

function bindHeaderEvents() {
  const langBtn = document.getElementById('btn-lang-toggle');
  if (langBtn) {
    langBtn.onclick = () => {
      toggleLang();
    };
  }
}

function bindUploadEvents() {
  const fileInput = document.getElementById('file-upload-input');
  const dropzone = document.getElementById('upload-dropzone');
  const uploadBtnHeader = document.getElementById('btn-upload-header');

  if (uploadBtnHeader) {
    uploadBtnHeader.onclick = () => fileInput.click();
  }

  if (dropzone) {
    dropzone.onclick = () => fileInput.click();

    dropzone.ondragover = (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    };

    dropzone.ondragleave = () => {
      dropzone.classList.remove('drag-over');
    };

    dropzone.ondrop = (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    };
  }

  if (fileInput) {
    fileInput.onchange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
      }
    };
  }
}

function handleFileSelect(file) {
  if (!file.type.startsWith('video/')) {
    showToast('الرجاء اختيار ملف فيديو صالح | Please select a valid video file', 'error');
    return;
  }

  showToast('جاري رفع ومعالجة الفيديو... | Uploading video...', 'info');

  editor.addVideoClip(file).then((clip) => {
    showToast('تم تحميل الفيديو بنجاح! | Video loaded successfully!', 'success');
    
    // Hide initial landing container, reveal editor workspace
    document.getElementById('landing-view')?.classList.add('hidden');
    document.getElementById('editor-workspace')?.classList.remove('hidden');

    // Sync timeline
    timeline.setDuration(editor.getTotalDuration());
    timeline.setClips(editor.clips);
    timeline.setTextLayers(editor.textLayers);

    // Sync inputs
    document.getElementById('trim-end-input').value = clip.duration.toFixed(1);
    
    // Resize canvas preview container responsively
    resizeCanvasContainer();
  }).catch((err) => {
    console.error(err);
    showToast('حدث خطأ أثناء تحميل الفيديو | Error loading video', 'error');
  });
}

function bindPlaybackEvents() {
  const playBtn = document.getElementById('btn-play-pause');
  const rewindBtn = document.getElementById('btn-rewind');

  if (playBtn) {
    playBtn.onclick = () => {
      const isPlaying = editor.togglePlay();
      playBtn.querySelector('.icon').textContent = isPlaying ? '⏸' : '▶';
    };
  }

  if (rewindBtn) {
    rewindBtn.onclick = () => {
      editor.seekTo(0);
      timeline.setCurrentTime(0);
    };
  }
}

function bindToolTabs() {
  const tabBtns = document.querySelectorAll('.tool-tab-btn');
  const tabPanels = document.querySelectorAll('.tool-panel');

  tabBtns.forEach((btn) => {
    btn.onclick = () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach((b) => b.classList.remove('active'));
      tabPanels.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      const activePanel = document.getElementById(`panel-${targetTab}`);
      if (activePanel) {
        activePanel.classList.add('active');
      }

      // If watermark tab opened, highlight region overlay
      if (targetTab === 'watermark') {
        watermarkRemover.setEnabled(true);
        const toggle = document.getElementById('watermark-enable-toggle');
        if (toggle) toggle.checked = true;
        editor.renderCurrentFrame();
      }
    };
  });
}

function bindTrimTool() {
  const applyBtn = document.getElementById('btn-apply-trim');
  const resetBtn = document.getElementById('btn-reset-trim');

  if (applyBtn) {
    applyBtn.onclick = () => {
      const start = document.getElementById('trim-start-input').value;
      const end = document.getElementById('trim-end-input').value;
      editor.trimActiveClip(start, end);
      timeline.setDuration(editor.getTotalDuration());
      timeline.setClips(editor.clips);
      showToast('تم تطبيق القص | Trim applied', 'success');
    };
  }

  if (resetBtn) {
    resetBtn.onclick = () => {
      const clip = editor.getCurrentClip();
      if (clip) {
        document.getElementById('trim-start-input').value = 0;
        document.getElementById('trim-end-input').value = clip.duration.toFixed(1);
        editor.trimActiveClip(0, clip.duration);
        timeline.setDuration(editor.getTotalDuration());
        timeline.setClips(editor.clips);
      }
    };
  }
}

function bindSplitTool() {
  const splitBtn = document.getElementById('btn-split-at-cursor');
  if (splitBtn) {
    splitBtn.onclick = () => {
      const splitTime = editor.currentTime;
      const newClip = editor.splitClipAt(splitTime);
      if (newClip) {
        timeline.setDuration(editor.getTotalDuration());
        timeline.setClips(editor.clips);
        showToast('تم تقسيم الفيديو إلى مقطعين | Split clip successfully', 'success');
      } else {
        showToast('لا يمكن التقسيم عند هذا الموقع | Cannot split at current position', 'warning');
      }
    };
  }
}

function bindMergeTool() {
  const addMergeInput = document.getElementById('merge-file-input');
  const addMergeBtn = document.getElementById('btn-add-merge-clip');

  if (addMergeBtn && addMergeInput) {
    addMergeBtn.onclick = () => addMergeInput.click();
    addMergeInput.onchange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
        editor.addVideoClip(e.target.files[0]).then(() => {
          timeline.setDuration(editor.getTotalDuration());
          timeline.setClips(editor.clips);
          updateMergeClipsList();
          showToast('تمت إضافة المقطع للدمج | Clip added to merge list', 'success');
        });
      }
    };
  }
}

function updateMergeClipsList() {
  const listContainer = document.getElementById('merge-clips-list');
  if (!listContainer) return;

  listContainer.innerHTML = editor.clips.map((c, i) => `
    <div class="clip-item">
      <span>${i + 1}. ${c.name}</span>
      <span class="badge">${(c.endTime - c.startTime).toFixed(1)}s</span>
    </div>
  `).join('');
}

function bindEnhanceTool() {
  const brightnessInput = document.getElementById('filter-brightness');
  const contrastInput = document.getElementById('filter-contrast');
  const saturationInput = document.getElementById('filter-saturation');
  const sharpnessInput = document.getElementById('filter-sharpness');
  const resSelect = document.getElementById('filter-resolution');
  const resetBtn = document.getElementById('btn-reset-filters');

  const updateFilters = () => {
    if (brightnessInput) editor.setFilter('brightness', brightnessInput.value);
    if (contrastInput) editor.setFilter('contrast', contrastInput.value);
    if (saturationInput) editor.setFilter('saturation', saturationInput.value);
    if (sharpnessInput) editor.setFilter('sharpness', sharpnessInput.value);
    if (resSelect) editor.setFilter('resolutionScale', resSelect.value);
  };

  if (brightnessInput) brightnessInput.oninput = updateFilters;
  if (contrastInput) contrastInput.oninput = updateFilters;
  if (saturationInput) saturationInput.oninput = updateFilters;
  if (sharpnessInput) sharpnessInput.oninput = updateFilters;
  if (resSelect) resSelect.onchange = updateFilters;

  if (resetBtn) {
    resetBtn.onclick = () => {
      if (brightnessInput) brightnessInput.value = 100;
      if (contrastInput) contrastInput.value = 100;
      if (saturationInput) saturationInput.value = 100;
      if (sharpnessInput) sharpnessInput.value = 0;
      if (resSelect) resSelect.value = 'original';
      editor.resetFilters();
      showToast('تمت إعادة ضبط المؤثرات | Filters reset', 'info');
    };
  }
}

function bindAudioTool() {
  const volumeInput = document.getElementById('audio-volume');
  const muteBtn = document.getElementById('audio-mute-toggle');
  const noiseSelect = document.getElementById('audio-noise-select');
  const vocalCheck = document.getElementById('audio-vocal-boost');

  if (volumeInput) {
    volumeInput.oninput = (e) => audioEngine.setVolume(e.target.value);
  }

  if (muteBtn) {
    muteBtn.onclick = () => {
      const muted = audioEngine.toggleMute();
      muteBtn.textContent = muted ? t('unmute_toggle') : t('mute_toggle');
      muteBtn.classList.toggle('btn-danger', muted);
    };
  }

  if (noiseSelect) {
    noiseSelect.onchange = (e) => {
      audioEngine.setNoiseFilterMode(e.target.value);
      showToast('تم تحديث فلتر الصوت | Audio filter updated', 'info');
    };
  }

  if (vocalCheck) {
    vocalCheck.onchange = (e) => {
      audioEngine.setVocalBoost(e.target.checked);
    };
  }
}

function bindTextTool() {
  const addBtn = document.getElementById('btn-add-text');
  const inputTxt = document.getElementById('text-input-val');
  const fontFamilySel = document.getElementById('text-font-family');
  const fontSizeInput = document.getElementById('text-font-size');
  const colorInput = document.getElementById('text-color-picker');
  const bgColorInput = document.getElementById('text-bg-picker');
  const posXInput = document.getElementById('text-pos-x');
  const posYInput = document.getElementById('text-pos-y');

  if (addBtn) {
    addBtn.onclick = () => {
      const layer = editor.addTextLayer(inputTxt ? inputTxt.value : 'TEM EDIT');
      timeline.setTextLayers(editor.textLayers);
      showToast('تمت إضافة نص جديد | New text layer added', 'success');
    };
  }

  const updateTextLayerProps = () => {
    editor.updateSelectedTextLayer({
      text: inputTxt ? inputTxt.value : 'TEM EDIT',
      fontFamily: fontFamilySel ? fontFamilySel.value : 'Cairo, sans-serif',
      fontSize: fontSizeInput ? parseInt(fontSizeInput.value, 10) : 48,
      color: colorInput ? colorInput.value : '#ffffff',
      bgColor: bgColorInput ? bgColorInput.value : 'transparent',
      x: posXInput ? parseFloat(posXInput.value) : 0.5,
      y: posYInput ? parseFloat(posYInput.value) : 0.8
    });
    timeline.setTextLayers(editor.textLayers);
  };

  if (inputTxt) inputTxt.oninput = updateTextLayerProps;
  if (fontFamilySel) fontFamilySel.onchange = updateTextLayerProps;
  if (fontSizeInput) fontSizeInput.oninput = updateTextLayerProps;
  if (colorInput) colorInput.oninput = updateTextLayerProps;
  if (bgColorInput) bgColorInput.oninput = updateTextLayerProps;
  if (posXInput) posXInput.oninput = updateTextLayerProps;
  if (posYInput) posYInput.oninput = updateTextLayerProps;
}

function bindMusicTool() {
  const musicInput = document.getElementById('music-file-input');
  const uploadBtn = document.getElementById('btn-upload-music');
  const volumeInput = document.getElementById('music-volume');
  const loopCheck = document.getElementById('music-loop-toggle');
  const removeBtn = document.getElementById('btn-remove-music');

  if (uploadBtn && musicInput) {
    uploadBtn.onclick = () => musicInput.click();
    musicInput.onchange = (e) => {
      if (e.target.files && e.target.files.length > 0) {
        audioEngine.loadBackgroundMusic(e.target.files[0]);
        showToast('تمت إضافة الموسيقى الخلفية | Background music added', 'success');
      }
    };
  }

  if (volumeInput) volumeInput.oninput = (e) => audioEngine.setMusicVolume(e.target.value);
  if (loopCheck) loopCheck.onchange = (e) => audioEngine.setMusicLoop(e.target.checked);
  if (removeBtn) {
    removeBtn.onclick = () => {
      audioEngine.removeMusic();
      showToast('تمت إزالة الموسيقى | Music removed', 'info');
    };
  }
}

function bindWatermarkTool() {
  const enableToggle = document.getElementById('watermark-enable-toggle');
  const methodSelect = document.getElementById('watermark-method');
  const blurSlider = document.getElementById('watermark-blur-slider');

  if (enableToggle) {
    enableToggle.onchange = (e) => {
      watermarkRemover.setEnabled(e.target.checked);
      editor.renderCurrentFrame();
    };
  }

  if (methodSelect) {
    methodSelect.onchange = (e) => {
      watermarkRemover.setMethod(e.target.value);
      editor.renderCurrentFrame();
    };
  }

  if (blurSlider) {
    blurSlider.oninput = (e) => {
      watermarkRemover.setBlurRadius(e.target.value);
      editor.renderCurrentFrame();
    };
  }
}

function bindExportEvents() {
  const exportBtnHeader = document.getElementById('btn-export-header');
  const startExportBtn = document.getElementById('btn-start-export');
  const cancelExportBtn = document.getElementById('btn-cancel-export');

  if (exportBtnHeader) {
    exportBtnHeader.onclick = () => {
      openModal('modal-export');
    };
  }

  if (startExportBtn) {
    startExportBtn.onclick = () => {
      const resSelect = document.getElementById('export-res-select');
      const fpsSelect = document.getElementById('export-fps-select');

      const progressWrapper = document.getElementById('export-progress-wrapper');
      const progressBar = document.getElementById('export-progress-bar');
      const statusText = document.getElementById('export-status-text');

      if (progressWrapper) progressWrapper.classList.remove('hidden');

      exportEngine.exportVideo({
        resolutionScale: resSelect ? resSelect.value : '1080p',
        fps: fpsSelect ? parseInt(fpsSelect.value, 10) : 30,
        onProgress: (percent) => {
          if (progressBar) progressBar.style.width = `${percent}%`;
        },
        onStatusChange: (text) => {
          if (statusText) statusText.textContent = text;
        }
      }).then(() => {
        showToast('تم تصدير وتحميل الفيديو بنجاح! | Export complete!', 'success');
        setTimeout(() => closeModal('modal-export'), 1500);
      }).catch((err) => {
        console.error(err);
        showToast(err.message || 'حدث خطأ أثناء التصدير | Export error', 'error');
      });
    };
  }

  if (cancelExportBtn) {
    cancelExportBtn.onclick = () => {
      exportEngine.cancelExport();
      closeModal('modal-export');
    };
  }
}

function resizeCanvasContainer() {
  const container = document.getElementById('canvas-container');
  if (container && editor && editor.canvas) {
    // Dynamic aspect ratio calculation
    const aspect = editor.canvas.height / editor.canvas.width;
    const maxW = container.clientWidth;
    const maxH = window.innerHeight * 0.55;

    let targetW = maxW;
    let targetH = targetW * aspect;

    if (targetH > maxH) {
      targetH = maxH;
      targetW = targetH / aspect;
    }

    editor.canvas.style.width = `${targetW}px`;
    editor.canvas.style.height = `${targetH}px`;
  }
}

window.addEventListener('resize', resizeCanvasContainer);

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => container.removeChild(toast), 300);
  }, 3500);
}
