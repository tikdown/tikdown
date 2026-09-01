/**
 * TEM Edit - Internationalization (i18n) Module
 * Handles Arabic (RTL) and English (LTR) language switching.
 */

export const translations = {
  ar: {
    // App Header
    app_title: 'TEM Edit',
    app_subtitle: 'محرر الفيديو الاحترافي',
    upload_btn: 'رفع فيديو',
    export_btn: 'تصدير الفيديو',
    lang_toggle: 'English',
    
    // Welcome / Landing
    welcome_title: 'مرحباً بك في TEM Edit',
    welcome_desc: 'محرر فيديو احترافي، سريع، ومجاني يعمل مباشرة في متصفحك دون الحاجة لرفع فيديوهاتك إلى خوادم خارجية.',
    select_file_btn: 'اختر فيديو من جهازك',
    drag_drop_hint: 'أو اسحب الفيديو وأفلته هنا',
    supported_formats_hint: 'يدعم صيغ MP4, WebM, MOV بحجم يصل إلى 500 ميجابايت',
    
    // Tool Categories & Tabs
    tab_trim: 'قص وتحديد',
    tab_split: 'تقسيم',
    tab_merge: 'دمج مقاطع',
    tab_enhance: 'تحسين الجودة',
    tab_audio: 'تحسين الصوت',
    tab_text: 'إضافة نصوص',
    tab_music: 'إضافة موسيقى',
    tab_watermark: 'تنظيف المارك',
    
    // Tools: Trim
    trim_title: 'قص وتحديد المقطع',
    trim_desc: 'حدد بداية ونهاية الجزء المراد الاحتفاظ به من الفيديو.',
    start_time: 'وقت البداية (ثواني):',
    end_time: 'وقت النهاية (ثواني):',
    apply_trim: 'تطبيق القص',
    reset_trim: 'إعادة ضبط',
    
    // Tools: Split
    split_title: 'تقسيم الفيديو',
    split_desc: 'قسم الفيديو الحالي عند مؤشر التشغيل إلى مقطعين مستقلين.',
    split_at_cursor: 'تقسيم عند المؤشر الحالي',
    split_time_label: 'موقع التقسيم:',
    
    // Tools: Merge
    merge_title: 'دمج عدة مقاطع',
    merge_desc: 'أضف مقاطع فيديو إضافية لدمجها متسلسلة في فيديو واحد.',
    add_clip: 'إضافة مقطع آخر',
    clips_list: 'قائمة المقاطع:',
    drag_reorder_hint: 'يمكنك إعادة ترتيب المقاطع بالحب والتركيب',
    
    // Tools: Enhance
    enhance_title: 'تحسين جودة الفيديو وتكبير الدقة',
    enhance_desc: 'عدّل السطوع والتباين والوضوح، واصنع دقة أعلى لعرض ممتاز.',
    brightness: 'السطوع (Brightness)',
    contrast: 'التباين (Contrast)',
    saturation: 'تشبع الألوان (Saturation)',
    sharpness: 'حدّة التفاصيل (Sharpness)',
    denoise_video: 'تقليل ضوضاء الصورة',
    resolution_scale: 'تكبير وتصدير الدقة:',
    res_original: 'الدقة الأصلية',
    res_1080p: '1080p Full HD',
    res_2k: '2K Quad HD',
    res_4k: '4K Ultra HD',
    apply_filters: 'تطبيق المؤثرات',
    reset_filters: 'إعادة ضبط المؤثرات',
    
    // Tools: Audio
    audio_title: 'تنقية وتعديل الصوت',
    audio_desc: 'قم بإزالة الضوضاء وتقليل الصفير والتحكم في مستوى الصوت.',
    volume: 'مستوى الصوت الأصلي:',
    mute_toggle: 'كتم الصوت',
    unmute_toggle: 'تشغيل الصوت',
    noise_reduction: 'فلتر تنقية الضوضاء:',
    noise_off: 'إيقاف الفلتر',
    noise_light: 'تنقية خفيفة (عزل الصفير)',
    noise_medium: 'تنقية متوسطة (ضوضاء الخلفية)',
    noise_strong: 'تنقية قوية (عزل المحادثة)',
    vocal_boost: 'تعزيز وضوح الصوت البشري',
    
    // Tools: Text
    text_title: 'إضافة وتنسيق النصوص',
    text_desc: 'أضف عناوين ونصوص متحركة فوق الفيديو.',
    add_new_text: 'إضافة نص جديد',
    text_input_placeholder: 'اكتب النص هنا...',
    font_family: 'نوع الخط:',
    font_size: 'حجم الخط:',
    text_color: 'لون النص:',
    bg_color: 'لون الخلفية:',
    stroke_color: 'لون الإطار:',
    position_x: 'الموقع الأفقي (X):',
    position_y: 'الموقع الرأسي (Y):',
    drag_text_hint: 'يمكنك أيضاً سحب النص مباشرة فوق شاشة المعاينة',
    
    // Tools: Background Music
    music_title: 'إضافة موسيقى خلفية',
    music_desc: 'أضف ملف صوتي أو موسيقى من جهازك ودمجها مع الصوت الأصلي.',
    upload_music_btn: 'اختر ملف صوتي (MP3/WAV)',
    bg_music_volume: 'مستوى صوت الموسيقى:',
    loop_music: 'تكرار الموسيقى تلقائياً',
    remove_music: 'إزالة الموسيقى',
    
    // Tools: Watermark Cleanup
    watermark_title: 'إزالة وتنظيف العلامة المائية',
    watermark_desc: 'أداة تظليل وتمويه المارك أو الشعار المزعج للمحتوى المملوك لك.',
    watermark_disclaimer: 'تنبيه: يجب استخدام هذه الأداة فقط على الفيديوهات التي تملك حقوق تعديلها وترخيصها.',
    enable_watermark_cleaner: 'تفعيل أداة تنظيف المنطقة',
    cleaner_type: 'طريقة التنظيف:',
    clean_blur: 'تمويه بلور (Gaussian Blur)',
    clean_pixelate: 'بكسلة (Pixelate Mosaic)',
    blur_strength: 'قوة التمويه:',
    selection_instructions: 'اسحب وحرك مربع التحديد الأزرق فوق شاشة المعاينة لضبط المنطقة.',
    
    // Timeline Controls & Scrubber
    timeline_title: 'الخط الزمني (Timeline)',
    track_video: 'مسار الفيديو',
    track_audio: 'مسار الصوت والموسيقى',
    track_text: 'مسار النصوص',
    play: 'تشغيل',
    pause: 'إيقاف مؤقت',
    rewind: 'إعادة للبداية',
    zoom_in: 'تكبير',
    zoom_out: 'تصغير',
    delete_selected: 'حذف المحدد',
    
    // Export Modal & Processing
    export_dialog_title: 'تصدير الفيديو',
    export_quality: 'جودة التصدير:',
    export_fps: 'معدل الإطارات (FPS):',
    start_export_btn: 'بدء التصدير الآن',
    exporting_status: 'جاري معالجة وتصدير الفيديو...',
    export_progress: 'مستوى التقدم:',
    export_complete: 'تم التصدير بنجاح!',
    download_video_btn: 'تحميل الفيديو المعدل',
    export_cancel: 'إلغاء',
    
    // Footer & Tomas Magdy Section
    editor_credits_title: 'تم المونتير | TEM Editor',
    editor_name: 'TOMAS MAGDY',
    contact_me_btn: 'تواصل معي',
    contact_modal_title: 'تواصل مع المونتير توماس مجدي',
    contact_whatsapp: 'واتساب',
    contact_email: 'البريد الإلكتروني',
    contact_telegram: 'تيليجرام',
    contact_portfolio: 'معرض الأعمال',
    close_btn: 'إغلاق',
    
    // Legal & AdSense
    privacy_policy: 'سياسة الخصوصية',
    terms_of_service: 'شروط الاستخدام',
    contact_us: 'اتصل بنا',
    ad_space_notice: 'مساحة إعلانية'
  },
  en: {
    // App Header
    app_title: 'TEM Edit',
    app_subtitle: 'Professional Video Editor',
    upload_btn: 'Upload Video',
    export_btn: 'Export Video',
    lang_toggle: 'العربية',
    
    // Welcome / Landing
    welcome_title: 'Welcome to TEM Edit',
    welcome_desc: 'Professional, fast, and free video editor running directly in your browser without uploading to external servers.',
    select_file_btn: 'Select Video from Device',
    drag_drop_hint: 'Or drag and drop video here',
    supported_formats_hint: 'Supports MP4, WebM, MOV formats up to 500 MB',
    
    // Tool Categories & Tabs
    tab_trim: 'Trim & Cut',
    tab_split: 'Split',
    tab_merge: 'Merge Clips',
    tab_enhance: 'Enhance Quality',
    tab_audio: 'Audio Cleanup',
    tab_text: 'Add Text',
    tab_music: 'Add Music',
    tab_watermark: 'Clean Watermark',
    
    // Tools: Trim
    trim_title: 'Trim & Cut Clip',
    trim_desc: 'Set the start and end point of the video segment to keep.',
    start_time: 'Start Time (seconds):',
    end_time: 'End Time (seconds):',
    apply_trim: 'Apply Trim',
    reset_trim: 'Reset Trim',
    
    // Tools: Split
    split_title: 'Split Video',
    split_desc: 'Split the current video clip at playhead cursor into two independent segments.',
    split_at_cursor: 'Split at Playhead',
    split_time_label: 'Split Point:',
    
    // Tools: Merge
    merge_title: 'Merge Multiple Clips',
    merge_desc: 'Add additional video clips to merge sequentially into a single video file.',
    add_clip: 'Add Another Clip',
    clips_list: 'Clips List:',
    drag_reorder_hint: 'You can drag and reorder clips easily',
    
    // Tools: Enhance
    enhance_title: 'Enhance Video Quality & Resolution',
    enhance_desc: 'Adjust brightness, contrast, color saturation, sharpness, and upscale resolution.',
    brightness: 'Brightness',
    contrast: 'Contrast',
    saturation: 'Color Saturation',
    sharpness: 'Detail Sharpness',
    denoise_video: 'Image Noise Reduction',
    resolution_scale: 'Upscale & Export Resolution:',
    res_original: 'Original Resolution',
    res_1080p: '1080p Full HD',
    res_2k: '2K Quad HD',
    res_4k: '4K Ultra HD',
    apply_filters: 'Apply Filters',
    reset_filters: 'Reset Filters',
    
    // Tools: Audio
    audio_title: 'Audio Cleanup & Enhancement',
    audio_desc: 'Remove noise, cut hums/hissing, and adjust master audio volume.',
    volume: 'Master Audio Volume:',
    mute_toggle: 'Mute Audio',
    unmute_toggle: 'Unmute Audio',
    noise_reduction: 'Noise Cleanup Filter:',
    noise_off: 'Disabled',
    noise_light: 'Light Denoise (Cut Hiss)',
    noise_medium: 'Medium Denoise (Background Noise)',
    noise_strong: 'Strong Denoise (Vocal Isolation)',
    vocal_boost: 'Enhance Vocal Clarity',
    
    // Tools: Text
    text_title: 'Add & Style Text Overlays',
    text_desc: 'Add titles, captions, and styled text layers over the video.',
    add_new_text: 'Add New Text',
    text_input_placeholder: 'Type text here...',
    font_family: 'Font Family:',
    font_size: 'Font Size:',
    text_color: 'Text Color:',
    bg_color: 'Background Color:',
    stroke_color: 'Outline Color:',
    position_x: 'Horizontal Position (X):',
    position_y: 'Vertical Position (Y):',
    drag_text_hint: 'You can also drag text directly on the preview screen',
    
    // Tools: Background Music
    music_title: 'Add Background Music',
    music_desc: 'Upload an audio file or music from device and mix with original audio track.',
    upload_music_btn: 'Select Audio File (MP3/WAV)',
    bg_music_volume: 'Background Music Volume:',
    loop_music: 'Loop Music Track',
    remove_music: 'Remove Music',
    
    // Tools: Watermark Cleanup
    watermark_title: 'Clean / Obscure Watermark',
    watermark_desc: 'Blur or pixelate unwanted watermark or logo area on user-owned videos.',
    watermark_disclaimer: 'Notice: Use this tool only on video content you own the rights to modify.',
    enable_watermark_cleaner: 'Enable Region Clean Tool',
    cleaner_type: 'Cleanup Technique:',
    clean_blur: 'Gaussian Blur',
    clean_pixelate: 'Pixelate Mosaic',
    blur_strength: 'Blur Intensity:',
    selection_instructions: 'Drag and resize the selection box over the preview screen to target area.',
    
    // Timeline Controls & Scrubber
    timeline_title: 'Timeline Track Editor',
    track_video: 'Video Track',
    track_audio: 'Audio Track',
    track_text: 'Text Track',
    play: 'Play',
    pause: 'Pause',
    rewind: 'Rewind',
    zoom_in: 'Zoom In',
    zoom_out: 'Zoom Out',
    delete_selected: 'Delete Selected',
    
    // Export Modal & Processing
    export_dialog_title: 'Export Video',
    export_quality: 'Export Quality:',
    export_fps: 'Frame Rate (FPS):',
    start_export_btn: 'Start Export Now',
    exporting_status: 'Processing and exporting video...',
    export_progress: 'Progress:',
    export_complete: 'Export completed successfully!',
    download_video_btn: 'Download Edited Video',
    export_cancel: 'Cancel',
    
    // Footer & Tomas Magdy Section
    editor_credits_title: 'TEM Editor',
    editor_name: 'TOMAS MAGDY',
    contact_me_btn: 'Contact Me',
    contact_modal_title: 'Contact Editor Tomas Magdy',
    contact_whatsapp: 'WhatsApp',
    contact_email: 'Email',
    contact_telegram: 'Telegram',
    contact_portfolio: 'Portfolio',
    close_btn: 'Close',
    
    // Legal & AdSense
    privacy_policy: 'Privacy Policy',
    terms_of_service: 'Terms of Service',
    contact_us: 'Contact Us',
    ad_space_notice: 'Advertisement Space'
  }
};

let currentLang = 'ar';

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (translations[lang]) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    updateDOMTranslations();
    
    // Dispatch event so editor components can react
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }
}

export function toggleLang() {
  setLang(currentLang === 'ar' ? 'en' : 'ar');
}

export function t(key) {
  return translations[currentLang]?.[key] || translations['en']?.[key] || key;
}

export function updateDOMTranslations() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const translatedText = t(key);
    if (el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit')) {
      el.value = translatedText;
    } else if (el.hasAttribute('placeholder')) {
      el.placeholder = translatedText;
    } else {
      el.textContent = translatedText;
    }
  });

  const altElements = document.querySelectorAll('[data-i18n-alt]');
  altElements.forEach((el) => {
    const key = el.getAttribute('data-i18n-alt');
    el.alt = t(key);
  });

  const titleElements = document.querySelectorAll('[data-i18n-title]');
  titleElements.forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    el.title = t(key);
  });
}
