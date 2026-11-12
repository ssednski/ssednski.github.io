// Sends the contact form through FormSubmit without leaving the page.
// Without JavaScript the form still works: it posts to FormSubmit directly.
(function () {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.contact-status');
  // https://formsubmit.co/you@example.com -> https://formsubmit.co/ajax/you@example.com
  const endpoint = form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');

  function showStatus(text, kind) {
    status.textContent = text;
    status.className = 'contact-status' + (kind ? ' ' + kind : '');
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    button.disabled = true;
    showStatus('Sending…');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || String(result.success) === 'false') {
        throw new Error(result.message || 'Request failed');
      }
      form.reset();
      showStatus('Thanks! Your message was sent.', 'success');
    } catch (error) {
      showStatus('Sorry, that didn’t send. Please email jacksedensky@gmail.com directly.', 'error');
    } finally {
      button.disabled = false;
    }
  });
})();
