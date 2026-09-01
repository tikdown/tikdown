/**
 * TEM Edit - Modals & Dialog Manager
 * Controls Contact Tomas Magdy modal, Privacy Policy, Terms of Service, 
 * and Export Progress Dialog.
 */

import { CONTACT_CONFIG } from './config.js';
import { t } from './i18n.js';

export function initModals() {
  bindModalEvents('btn-open-contact', 'modal-contact', populateContactModal);
  bindModalEvents('btn-open-privacy', 'modal-privacy');
  bindModalEvents('btn-open-terms', 'modal-terms');
  
  // Close modals when clicking backdrop
  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop.id);
      }
    });
  });

  // Close buttons inside modals
  document.querySelectorAll('.modal-close-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-backdrop');
      if (modal) {
        closeModal(modal.id);
      }
    });
  });
}

export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function bindModalEvents(btnId, modalId, onOpen = null) {
  const btn = document.getElementById(btnId);
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (onOpen) onOpen();
      openModal(modalId);
    });
  }
}

function populateContactModal() {
  const { name, title, role, whatsapp, email, telegram, portfolio, socials } = CONTACT_CONFIG;

  const container = document.getElementById('contact-modal-body');
  if (!container) return;

  const cleanWhatsapp = whatsapp.replace(/[^\d+]/g, '');

  container.innerHTML = `
    <div class="contact-card-header">
      <div class="avatar-badge">TM</div>
      <div class="contact-details">
        <h3 class="editor-name">${name}</h3>
        <p class="editor-role">${title}</p>
        <span class="role-tag">${role}</span>
      </div>
    </div>

    <div class="contact-actions-grid">
      <a href="https://wa.me/${cleanWhatsapp}" target="_blank" rel="noopener" class="contact-btn whatsapp-btn">
        <span class="icon">💬</span>
        <div class="btn-text">
          <span class="label">${t('contact_whatsapp')}</span>
          <span class="val">${whatsapp}</span>
        </div>
      </a>

      <a href="mailto:${email}" class="contact-btn email-btn">
        <span class="icon">✉️</span>
        <div class="btn-text">
          <span class="label">${t('contact_email')}</span>
          <span class="val">${email}</span>
        </div>
      </a>

      <a href="https://t.me/${telegram}" target="_blank" rel="noopener" class="contact-btn telegram-btn">
        <span class="icon">✈️</span>
        <div class="btn-text">
          <span class="label">${t('contact_telegram')}</span>
          <span class="val">@${telegram}</span>
        </div>
      </a>

      <a href="${portfolio}" target="_blank" rel="noopener" class="contact-btn portfolio-btn">
        <span class="icon">🌐</span>
        <div class="btn-text">
          <span class="label">${t('contact_portfolio')}</span>
          <span class="val">Website / Portfolio</span>
        </div>
      </a>
    </div>
  `;
}
