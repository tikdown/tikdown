/**
 * TEM Edit - Real-Time Video Export Engine
 * Encodes the final canvas composition + mixed Web Audio graph stream into a 
 * downloadable high-definition video file (WebM / MP4) with live progress tracking.
 */

import { audioEngine } from './audioEngine.js';

export class ExportEngine {
  constructor(editor) {
    this.editor = editor;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isExporting = false;
  }

  exportVideo(options = {}) {
    return new Promise((resolve, reject) => {
      const {
        resolutionScale = '1080p', // 'original', '1080p', '4k'
        fps = 30,
        onProgress = () => {},
        onStatusChange = () => {}
      } = options;

      const clip = this.editor.getCurrentClip();
      if (!clip) {
        return reject(new Error('لا يوجد فيديو للتصدير | No video loaded to export'));
      }

      this.isExporting = true;
      this.recordedChunks = [];

      // Determine export target canvas dimensions
      let exportWidth = clip.originalWidth || 1920;
      let exportHeight = clip.originalHeight || 1080;

      if (resolutionScale === '1080p') {
        exportWidth = 1920;
        exportHeight = 1080;
      } else if (resolutionScale === '4k') {
        exportWidth = 3840;
        exportHeight = 2160;
      }

      // Create high-res offscreen rendering canvas
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = exportWidth;
      exportCanvas.height = exportHeight;
      const exportCtx = exportCanvas.getContext('2d', { willReadFrequently: true });

      // Save original canvas reference and temporary switch editor context
      const originalCanvas = this.editor.canvas;
      const originalCtx = this.editor.ctx;
      this.editor.canvas = exportCanvas;
      this.editor.ctx = exportCtx;

      // Capture Canvas Video Stream
      const canvasStream = exportCanvas.captureStream(fps);
      const compositeStream = new MediaStream();

      // Add Video Track from canvas
      canvasStream.getVideoTracks().forEach((track) => compositeStream.addTrack(track));

      // Add Audio Track from Web Audio API destination
      const audioTrack = audioEngine.getAudioStreamTrack();
      if (audioTrack) {
        compositeStream.addTrack(audioTrack);
      }

      // Select supported MimeType
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      try {
        this.mediaRecorder = new MediaRecorder(compositeStream, {
          mimeType: mimeType,
          videoBitsPerSecond: resolutionScale === '4k' ? 25000000 : 8000000 // 25 Mbps for 4K, 8 Mbps for HD
        });
      } catch (err) {
        // Fallback to default options
        this.mediaRecorder = new MediaRecorder(compositeStream);
      }

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        // Restore original canvas context
        this.editor.canvas = originalCanvas;
        this.editor.ctx = originalCtx;
        this.isExporting = false;

        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const downloadUrl = URL.createObjectURL(blob);

        onProgress(100);
        onStatusChange('تم إكتمال التصدير! | Export Complete!');

        // Auto trigger download
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        a.download = `TEM_EDIT_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(downloadUrl);
        }, 100);

        resolve(downloadUrl);
      };

      // Start recording pass
      onStatusChange('جاري إعداد التصدير والمعالجة... | Preparing Export...');
      this.mediaRecorder.start(100);

      // Seek to start of clip and play through
      const duration = clip.endTime - clip.startTime;
      this.editor.seekTo(0);
      this.editor.play();

      const startTimeMs = Date.now();
      const progressInterval = setInterval(() => {
        if (!this.isExporting) {
          clearInterval(progressInterval);
          return;
        }

        const elapsedSecs = (Date.now() - startTimeMs) / 1000;
        const progressPercent = Math.min(99, Math.floor((elapsedSecs / duration) * 100));
        
        onProgress(progressPercent);
        onStatusChange(`جاري المعالجة: ${progressPercent}% | Processing: ${progressPercent}%`);

        if (elapsedSecs >= duration || !this.editor.isPlaying) {
          clearInterval(progressInterval);
          this.editor.pause();
          if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
          }
        }
      }, 200);
    });
  }

  cancelExport() {
    this.isExporting = false;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }
}
