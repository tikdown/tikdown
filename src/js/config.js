/**
 * TEM Edit Configuration File
 * Contains contact information, AdSense details, and editor default settings.
 */

export const CONTACT_CONFIG = {
  name: 'TOMAS MAGDY',
  title: 'TEM Editor | تم المونتير',
  role: 'Professional Video Editor & Content Creator',
  whatsapp: '+201000000000', // Replace with your actual WhatsApp number
  email: 'mjdyt0452@gmail.com', // Updated email address
  telegram: 'tomasmagdy', // Replace with your Telegram handle
  portfolio: 'https://github.com/TomasMagdy', // Replace with portfolio link
  socials: {
    youtube: 'https://youtube.com',
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com'
  }
};

export const ADSENSE_CONFIG = {
  // Set your AdSense Publisher ID here (e.g., 'ca-pub-1234567890123456')
  publisherId: 'ca-pub-XXXXXXXXXXXXXXXX',
  // Set to true once you paste your real Publisher ID
  enabled: false,
  slots: {
    landingTop: { id: 'AD_SLOT_LANDING_TOP', format: 'auto', responsive: true },
    sidebarBottom: { id: 'AD_SLOT_SIDEBAR', format: 'rectangle', responsive: true },
    footerBanner: { id: 'AD_SLOT_FOOTER', format: 'horizontal', responsive: true }
  }
};

export const APP_CONFIG = {
  appName: 'TEM Edit',
  tagline: 'Professional Browser Video Editor',
  taglineAr: 'محرر الفيديو الاحترافي على المتصفح',
  defaultLang: 'ar',
  supportedFormats: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska'],
  maxVideoUploadSizeMB: 500,
  defaultCanvasWidth: 1920,
  defaultCanvasHeight: 1080,
  defaultFps: 30
};
