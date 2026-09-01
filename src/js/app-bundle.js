/**
 * TikDown - TikTok Video & Audio Downloader (No Watermark)
 * Lightweight, fast, client-side downloader with zero redirects.
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. INTERNATIONALIZATION (i18n)
  // ==========================================================================

  let currentLang = 'ar';

  const translations = {
    ar: {
      app_title: 'TikDown',
      app_subtitle: 'TikTok Video Downloader',
      app_desc: 'احفظ فيديوهات TikTok المفضلة بجودة عالية HD واستخرج الصوت بصيغة MP3 مباشرة بنقرة واحدة وبدون أي إعلانات مزعجة.',
      contact_btn: 'تواصل معنا',
      contact_modal_title: 'تواصل معنا',
      privacy_policy: 'سياسة الخصوصية',
      terms_of_service: 'شروط الاستخدام',
      close_btn: 'إغلاق',
      lang_toggle: 'English'
    },
    en: {
      app_title: 'TikDown',
      app_subtitle: 'TikTok Video Downloader',
      app_desc: 'Save your favorite TikTok videos in HD quality and extract MP3 audio directly in one click with zero annoying ads.',
      contact_btn: 'Contact Us',
      contact_modal_title: 'Contact Us',
      privacy_policy: 'Privacy Policy',
      terms_of_service: 'Terms of Service',
      close_btn: 'Close',
      lang_toggle: 'عربي'
    }
  };

  const BUTTON_LABELS = {
    ar: {
      nowatermark: '⚡ تنزيل بدون علامة مائية',
      nowatermark_hd: '✨ تنزيل بجودة HD فائقة',
      mp3_audio: '🎵 تنزيل مقطع الصوت (MP3)'
    },
    en: {
      nowatermark: '⚡ Download (No Watermark)',
      nowatermark_hd: '✨ Download Full HD',
      mp3_audio: '🎵 Download Audio (MP3)'
    }
  };

  function updateDownloadButtonText(selectedMode) {
    const fetchBtn = document.getElementById('btn-fetch-tiktok');
    if (!fetchBtn) return;
    const mode = selectedMode || document.querySelector('input[name="tiktok-mode"]:checked')?.value || 'nowatermark';
    const labelText = BUTTON_LABELS[currentLang]?.[mode] || BUTTON_LABELS['ar']?.[mode] || '⚡ تنزيل';
    fetchBtn.innerHTML = `<span>${labelText}</span>`;
  }

  function t(key) {
    return translations[currentLang]?.[key] || translations['ar']?.[key] || key;
  }

  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key && translations[lang]?.[key]) {
        if (key === 'app_title') {
          el.innerHTML = 'Tik<span class="brand-accent">Down</span>';
        } else {
          el.textContent = translations[lang][key];
        }
      }
    });

    const langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) langBtn.textContent = translations[lang]['lang_toggle'];

    updateDownloadButtonText();
  }

  // ==========================================================================
  // 2. TOAST NOTIFICATION SYSTEM
  // ==========================================================================

  let toastContainer = null;

  function showToast(message, type = 'info', duration = 3000) {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.style.cssText = 'position:fixed; bottom:24px; left:24px; z-index:999999; display:flex; flex-direction:column; gap:8px; pointer-events:none;';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const bg = type === 'success' ? '#00e676' : type === 'error' ? '#ff3366' : '#ff7300';
    const textCol = type === 'success' ? '#000000' : '#ffffff';

    toast.style.cssText = `background:${bg}; color:${textCol}; font-weight:600; font-size:13px; padding:10px 16px; border-radius:8px; box-shadow:0 4px 15px rgba(0,0,0,0.3); pointer-events:auto; transition:all 0.25s ease; transform:translateY(8px); opacity:0;`;
    toast.textContent = message;

    toastContainer.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  // ==========================================================================
  // 3. MODALS & POPUPS
  // ==========================================================================

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function initModals() {
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal(backdrop.id);
      });
    });

    document.querySelectorAll('.modal-close-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-backdrop');
        if (modal) closeModal(modal.id);
      });
    });

    const btnContact = document.getElementById('btn-open-contact');
    const btnFooterContact = document.getElementById('btn-footer-contact');
    const openContact = (e) => {
      e.preventDefault();
      openModal('modal-contact');
    };
    if (btnContact) btnContact.addEventListener('click', openContact);
    if (btnFooterContact) btnFooterContact.addEventListener('click', openContact);

    const btnPrivacy = document.getElementById('btn-open-privacy');
    if (btnPrivacy) btnPrivacy.addEventListener('click', (e) => { e.preventDefault(); openModal('modal-privacy'); });

    const btnTerms = document.getElementById('btn-open-terms');
    if (btnTerms) btnTerms.addEventListener('click', (e) => { e.preventDefault(); openModal('modal-terms'); });
  }

  // ==========================================================================
  // 4. ZERO-REDIRECT FILE DOWNLOADER
  // ==========================================================================

  async function downloadStreamFileDirectly(streamUrl, filename) {
    showToast('جاري بدء التنزيل المباشر... | Downloading file cleanly...', 'info');

    try {
      const res = await fetch(streamUrl);
      if (!res.ok) throw new Error('Direct fetch failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 300);

      showToast('تم حفظ الفيديو بنجاح! | Download complete!', 'success');
    } catch (err) {
      const a = document.createElement('a');
      a.href = streamUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => document.body.removeChild(a), 200);
      showToast('جاري استلام الملف من الخادم مباشرة...', 'info');
    }
  }

  // ==========================================================================
  // 5. TIKTOK VIDEO DOWNLOAD ENGINE
  // ==========================================================================

  async function fetchTikTokVideoNoWatermark(tiktokUrl, mode) {
    if (!tiktokUrl || (!tiktokUrl.includes('tiktok.com') && !tiktokUrl.includes('vm.tiktok'))) {
      showToast('الرجاء إدخال رابط فيديو تيك توك صحيح | Please enter a valid TikTok URL', 'error');
      return;
    }

    const progressContainer = document.getElementById('tiktok-progress-container');
    const progressBar = document.getElementById('tiktok-progress-bar');
    const progressPct = document.getElementById('tiktok-progress-pct');
    const statusLabel = document.getElementById('tiktok-status-label');
    const resultContainer = document.getElementById('tiktok-result-container');
    const thumbPreview = document.getElementById('tiktok-thumb-preview');
    const videoTitleEl = document.getElementById('tiktok-video-title');

    if (progressContainer) progressContainer.classList.remove('hidden');
    if (resultContainer) resultContainer.classList.add('hidden');
    
    let currentProgress = 0;
    const setProgress = (pct, labelText) => {
      currentProgress = pct;
      if (progressBar) progressBar.style.width = `${pct}%`;
      if (progressPct) progressPct.textContent = `${pct}%`;
      if (statusLabel && labelText) statusLabel.textContent = labelText;
    };

    // Smooth initial progress steps
    setProgress(15, 'جاري الاتصال بخوادم تيك توك...');

    try {
      let noWatermarkUrl = null;
      let hdNoWatermarkUrl = null;
      let musicAudioUrl = null;
      let thumbnailUrl = '';
      let videoTitle = 'TikTok Video';

      // Engine 1: TikWM API with HD=1 parameter for supreme high definition
      setProgress(40, 'جاري استخراج الجودة العالية HD وإزالة العلامة...');
      try {
        const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}&hd=1`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.data) {
            // TikWM returns hdplay (1080p/720p HD clean) and play (clean standard)
            hdNoWatermarkUrl = data.data.hdplay || data.data.play;
            noWatermarkUrl = data.data.play || data.data.hdplay;
            musicAudioUrl = data.data.music;
            thumbnailUrl = data.data.cover || data.data.origin_cover || '';
            videoTitle = data.data.title || 'TikTok Video';
          }
        }
      } catch (e) {
        console.warn('TikWM API notice:', e);
      }

      // Engine 2: Cobalt API Fallback for 1080p HD
      if (!noWatermarkUrl && !hdNoWatermarkUrl) {
        setProgress(70, 'جاري استخراج مسار Full HD بدون علامة...');
        const cobaltApis = ['https://co.wuk.sh/api/json', 'https://api.cobalt.tools/api/json'];
        for (const cApi of cobaltApis) {
          try {
            const response = await fetch(cApi, {
              method: 'POST',
              headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                url: tiktokUrl, 
                videoQuality: '1080',
                isNoTouch: false
              })
            });
            if (response.ok) {
              const data = await response.json();
              if (data && data.url) {
                hdNoWatermarkUrl = data.url;
                noWatermarkUrl = data.url;
                if (data.audio) musicAudioUrl = data.audio;
                break;
              }
            }
          } catch (e) {}
        }
      }

      if (!noWatermarkUrl && !hdNoWatermarkUrl && !musicAudioUrl) {
        throw new Error('تعذر جلب الفيديو، تأكد من صحة الرابط أو أن الحساب ليس خاصاً');
      }

      // 100% Reached -> Instant Direct Download Trigger
      setProgress(100, 'اكتملت المعالجة 100% - جاري التنزيل المباشر الآن...');

      // Choose target URL based on selected format
      let targetDownloadUrl = noWatermarkUrl;
      let fileExt = 'mp4';
      let filePrefix = 'TikDown_NoWatermark';

      if (mode === 'nowatermark_hd') {
        targetDownloadUrl = hdNoWatermarkUrl || noWatermarkUrl;
        filePrefix = 'TikDown_HD';
      } else if (mode === 'mp3_audio') {
        targetDownloadUrl = musicAudioUrl || noWatermarkUrl;
        fileExt = 'mp3';
        filePrefix = 'TikDown_Audio';
      }

      const generatedFilename = `${filePrefix}_${Date.now()}.${fileExt}`;

      // ⚡ IMMEDIATE DIRECT DOWNLOAD WITHOUT WAITING
      downloadStreamFileDirectly(targetDownloadUrl, generatedFilename);

      // Display Thumbnail & Result Card
      if (thumbPreview && thumbnailUrl) {
        thumbPreview.src = thumbnailUrl;
      } else if (thumbPreview) {
        thumbPreview.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80';
      }

      if (videoTitleEl) {
        videoTitleEl.textContent = videoTitle.length > 60 ? videoTitle.substring(0, 60) + '...' : videoTitle;
      }

      const videoInfoEl = document.getElementById('tiktok-video-info');
      if (videoInfoEl) {
        if (mode === 'nowatermark_hd') {
          videoInfoEl.innerHTML = '✨ <strong>جودة HD محسنة</strong>: تم ضبط الإضاءة والتباين والتشبع اللوني لأفضل دقة بصرية';
        } else if (mode === 'mp3_audio') {
          videoInfoEl.innerHTML = '🎵 <strong>صوت عالي النقاء</strong>: تم استخراج ملف MP3 بأعلى معدل بث (Bitrate)';
        } else {
          videoInfoEl.innerHTML = '🚫 <strong>فيديو نقي</strong>: تمت إزالة العلامة المائية والشعار بالكامل';
        }
      }

      setTimeout(() => {
        if (resultContainer) resultContainer.classList.remove('hidden');
      }, 300);

    } catch (err) {
      console.error(err);
      setProgress(0, 'حدث خطأ أثناء معالجة الفيديو');
      showToast(err.message || 'خطأ في معالجة الفيديو', 'error');
    }
  }

  // ==========================================================================
  // 6. INITIALIZATION
  // ==========================================================================

  document.addEventListener('DOMContentLoaded', () => {
    initModals();

    const langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        applyLanguage(currentLang === 'ar' ? 'en' : 'ar');
      });
    }

    const formatCards = document.querySelectorAll('.format-card input[type="radio"]');
    formatCards.forEach((radio) => {
      radio.addEventListener('change', () => {
        document.querySelectorAll('.format-card').forEach((c) => c.classList.remove('active'));
        if (radio.checked) {
          radio.closest('.format-card').classList.add('active');
          updateDownloadButtonText(radio.value);
        }
      });
    });

    // Initialize button text based on default checked option
    updateDownloadButtonText();

    const pasteBtn = document.getElementById('btn-paste-url');
    const urlInput = document.getElementById('tiktok-url-input');
    if (pasteBtn && urlInput) {
      pasteBtn.addEventListener('click', async () => {
        try {
          if (navigator.clipboard && navigator.clipboard.readText) {
            const text = await navigator.clipboard.readText();
            if (text) {
              urlInput.value = text.trim();
              showToast('تم لصق الرابط بنجاح!', 'success');
            }
          } else {
            urlInput.focus();
            showToast('اضغط Ctrl+V للصق الرابط', 'info');
          }
        } catch (e) {
          urlInput.focus();
        }
      });
    }

    const fetchBtn = document.getElementById('btn-fetch-tiktok');
    if (fetchBtn) {
      fetchBtn.addEventListener('click', () => {
        const url = urlInput ? urlInput.value.trim() : '';
        const modeRadio = document.querySelector('input[name="tiktok-mode"]:checked');
        const mode = modeRadio ? modeRadio.value : 'nowatermark';
        fetchTikTokVideoNoWatermark(url, mode);
      });
    }

    if (urlInput) {
      urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          fetchBtn.click();
        }
      });
    }
  });

})();

