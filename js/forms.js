/**
 * ARVENAIRE Form Runtime
 * One source of truth for all Web3Forms submissions used by Home, Contact and Resources.
 */
(function () {
  'use strict';

  const CONFIG = Object.freeze({
    endpoint: 'https://api.web3forms.com/submit',
    accessKey: '5e418a41-4cad-44f0-9b93-eccaeff3f36c',
    defaultFromName: 'ARVENAIRE Website'
  });

  function setStatus(form, message, state) {
    const el = form.querySelector('[data-form-status]');
    if (!el) return;
    el.textContent = message || '';
    el.dataset.state = state || 'idle';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
  }

  function setBusy(form, busy) {
    const submit = form.querySelector('[type="submit"]');
    if (!submit) return;
    if (busy) {
      submit.dataset.originalLabel = submit.textContent;
      submit.disabled = true;
      submit.setAttribute('aria-busy', 'true');
      submit.textContent = form.dataset.loadingLabel || 'Sending…';
    } else {
      submit.disabled = false;
      submit.removeAttribute('aria-busy');
      if (submit.dataset.originalLabel) submit.textContent = submit.dataset.originalLabel;
    }
  }

  function normalizeFormData(form) {
    const fd = new FormData(form);
    fd.set('access_key', CONFIG.accessKey);
    fd.set('from_name', form.dataset.fromName || CONFIG.defaultFromName);
    fd.set('subject', form.dataset.subject || 'New ARVENAIRE Website Submission');
    fd.set('redirect', 'false');

    // Web3Forms accepts botcheck as a honeypot. Real users never see or fill it.
    if (!fd.has('botcheck')) fd.set('botcheck', '');

    // Add a small amount of safe context for routing/debugging.
    fd.set('page_url', window.location.href);
    fd.set('page_title', document.title);
    return fd;
  }

  async function submit(form) {
    if (!(form instanceof HTMLFormElement)) {
      throw new TypeError('ARVENAIRE.forms.submit expects an HTMLFormElement.');
    }

    if (!form.reportValidity()) return { success: false, validation: true };

    setBusy(form, true);
    setStatus(form, '', 'loading');

    try {
      const response = await fetch(CONFIG.endpoint, {
        method: 'POST',
        body: normalizeFormData(form),
        headers: { Accept: 'application/json' }
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch (_) {
        payload = null;
      }

      if (!response.ok || !payload || payload.success !== true) {
        const message = payload && payload.message ? payload.message : 'Submission could not be confirmed.';
        throw new Error(message);
      }

      const successMessage = form.dataset.successMessage || 'Thanks. Your submission was received.';
      setStatus(form, successMessage, 'success');
      form.dispatchEvent(new CustomEvent('arvenaire:form-success', { detail: payload }));

      const download = form.dataset.download;
      if (download) {
        // Use same-tab navigation after confirmed lead capture so popup blockers cannot swallow the file.
        window.setTimeout(() => { window.location.href = download; }, 350);
      } else if (form.dataset.resetOnSuccess !== 'false') {
        form.reset();
      }

      return payload;
    } catch (error) {
      console.error('[ARVENAIRE forms]', error);
      const message = form.dataset.errorMessage || 'We could not send this right now. Please try again.';
      setStatus(form, message, 'error');
      form.dispatchEvent(new CustomEvent('arvenaire:form-error', { detail: error }));
      return { success: false, error };
    } finally {
      setBusy(form, false);
    }
  }

  function bind(form) {
    if (!(form instanceof HTMLFormElement) || form.dataset.arvenaireBound === 'true') return;
    form.dataset.arvenaireBound = 'true';
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      submit(form);
    });
  }

  function bindAll(root) {
    (root || document).querySelectorAll('form[data-arvenaire-form]').forEach(bind);
  }

  window.ARVENAIRE = window.ARVENAIRE || {};
  window.ARVENAIRE.forms = Object.freeze({ submit, bind, bindAll });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => bindAll(document));
  } else {
    bindAll(document);
  }
})();
