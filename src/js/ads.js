/**
 * TEM Edit - AdSense Integration Module
 * Handles loading Google AdSense scripts and populating AD_SLOT positions 
 * cleanly outside the video editor workspace area.
 */

import { ADSENSE_CONFIG } from './config.js';
import { t } from './i18n.js';

export function initAds() {
  const { publisherId, enabled, slots } = ADSENSE_CONFIG;

  // 1. Inject real AdSense script if user configured publisher ID
  if (enabled && publisherId && publisherId !== 'ca-pub-XXXXXXXXXXXXXXXX') {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }

  // 2. Render AD_SLOT placeholders with clean styling and developer instructions
  renderAdSlot('ad-slot-landing', slots.landingTop, 'AD_SLOT_LANDING_TOP');
  renderAdSlot('ad-slot-sidebar', slots.sidebarBottom, 'AD_SLOT_SIDEBAR');
  renderAdSlot('ad-slot-footer', slots.footerBanner, 'AD_SLOT_FOOTER');
}

function renderAdSlot(elementId, slotConfig, slotName) {
  const container = document.getElementById(elementId);
  if (!container) return;

  const { publisherId, enabled } = ADSENSE_CONFIG;

  if (enabled && publisherId && publisherId !== 'ca-pub-XXXXXXXXXXXXXXXX') {
    // Real AdSense Unit
    container.innerHTML = `
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="${publisherId}"
           data-ad-slot="${slotConfig.id}"
           data-ad-format="${slotConfig.format || 'auto'}"
           data-full-width-responsive="true"></ins>
    `;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn('AdSense push notice:', e);
    }
  } else {
    // Non-intrusive Placeholder Card for monetisation readiness
    container.innerHTML = `
      <div class="ad-placeholder-card">
        <span class="ad-badge">${t('ad_space_notice')} (${slotName})</span>
        <p class="ad-hint">جاهز للربح! استبدل <code>${slotName}</code> بكود AdSense الخاص بك في <code>src/js/config.js</code></p>
      </div>
    `;
  }
}
