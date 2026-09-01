/**
 * TEM Edit - Watermark Clean-Up Module
 * Allows users to select a target ROI rectangle on canvas and apply 
 * real-time Gaussian blur or pixelation mosaic filter to clean/obscure watermarks.
 */

export class WatermarkRemover {
  constructor() {
    this.enabled = false;
    // Default ROI position: Small box in bottom-left corner
    this.x = 0.04;
    this.y = 0.82;
    this.width = 0.20;
    this.height = 0.12;
    this.method = 'blur'; // 'blur' or 'pixelate'
    this.blurRadius = 16;
    this.pixelSize = 12;

    this.isDragging = false;
    this.isResizing = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
  }

  setEnabled(val) {
    this.enabled = !!val;
  }

  setMethod(method) {
    if (method === 'blur' || method === 'pixelate') {
      this.method = method;
    }
  }

  setBlurRadius(radius) {
    this.blurRadius = parseInt(radius, 10);
  }

  drawOverlay(ctx, canvasWidth, canvasHeight) {
    if (!this.enabled) return;

    const rx = this.x * canvasWidth;
    const ry = this.y * canvasHeight;
    const rw = this.width * canvasWidth;
    const rh = this.height * canvasHeight;

    ctx.save();
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(rx, ry, rw, rh);

    ctx.fillStyle = 'rgba(0, 242, 254, 0.15)';
    ctx.fillRect(rx, ry, rw, rh);

    const handleSize = 8;
    ctx.fillStyle = '#00f2fe';
    ctx.fillRect(rx + rw - handleSize, ry + rh - handleSize, handleSize, handleSize);

    ctx.fillStyle = '#ffffff';
    ctx.font = '11px Cairo, sans-serif';
    ctx.fillText('Watermark Target Region', rx + 4, ry + 14);
    ctx.restore();
  }

  applyCleanFilter(ctx, canvasWidth, canvasHeight) {
    if (!this.enabled) return;

    const rx = Math.floor(this.x * canvasWidth);
    const ry = Math.floor(this.y * canvasHeight);
    const rw = Math.max(10, Math.floor(this.width * canvasWidth));
    const rh = Math.max(10, Math.floor(this.height * canvasHeight));

    if (rx < 0 || ry < 0 || rx + rw > canvasWidth || ry + rh > canvasHeight) return;

    if (this.method === 'blur') {
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.filter = `blur(${this.blurRadius}px)`;
      ctx.drawImage(ctx.canvas, 0, 0, canvasWidth, canvasHeight);
      ctx.restore();
    } else if (this.method === 'pixelate') {
      ctx.save();
      const offCanvas = document.createElement('canvas');
      const offCtx = offCanvas.getContext('2d');
      const smallW = Math.max(2, Math.floor(rw / this.pixelSize));
      const smallH = Math.max(2, Math.floor(rh / this.pixelSize));
      offCanvas.width = smallW;
      offCanvas.height = smallH;

      offCtx.drawImage(ctx.canvas, rx, ry, rw, rh, 0, 0, smallW, smallH);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(offCanvas, 0, 0, smallW, smallH, rx, ry, rw, rh);
      ctx.imageSmoothingEnabled = true;
      ctx.restore();
    }
  }

  handleMouseDown(e, canvasElement) {
    if (!this.enabled) return false;
    const rect = canvasElement.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    const rx = this.x;
    const ry = this.y;
    const rw = this.width;
    const rh = this.height;

    if (Math.abs(clickX - (rx + rw)) < 0.04 && Math.abs(clickY - (ry + rh)) < 0.04) {
      this.isResizing = true;
      return true;
    }

    if (clickX >= rx && clickX <= rx + rw && clickY >= ry && clickY <= ry + rh) {
      this.isDragging = true;
      this.dragStartX = clickX - this.x;
      this.dragStartY = clickY - this.y;
      return true;
    }

    return false;
  }

  handleMouseMove(e, canvasElement) {
    if (!this.enabled) return;
    const rect = canvasElement.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / rect.width;
    const currentY = (e.clientY - rect.top) / rect.height;

    if (this.isDragging) {
      this.x = Math.max(0, Math.min(1 - this.width, currentX - this.dragStartX));
      this.y = Math.max(0, Math.min(1 - this.height, currentY - this.dragStartY));
    } else if (this.isResizing) {
      this.width = Math.max(0.05, Math.min(1 - this.x, currentX - this.x));
      this.height = Math.max(0.05, Math.min(1 - this.y, currentY - this.y));
    }
  }

  handleMouseUp() {
    this.isDragging = false;
    this.isResizing = false;
  }
}

export const watermarkRemover = new WatermarkRemover();
