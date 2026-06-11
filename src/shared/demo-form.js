/* ============================================================
   demo-form.js — "Request a Demo" modal.
   Self-contained: builds its own DOM, ships its own CSS, and wires
   itself to the existing CTAs (.nav-demo in the nav, #closingCta in
   the sc8 closing scene). Loaded once via src/shared/setup.js.
   Submits to the Azure SWA managed Function at POST /api/demo-request.
   ============================================================ */
import '../styles/demo-form.css';

const overlay = document.createElement('div');
overlay.className = 'demo-modal';
overlay.setAttribute('aria-hidden', 'true');
overlay.innerHTML = `
  <div class="demo-modal__backdrop" data-demo-close></div>
  <div class="demo-modal__card" role="dialog" aria-modal="true" aria-label="Request a Demo">
    <button class="demo-modal__close" type="button" data-demo-close aria-label="Close">&times;</button>
    <h2 class="demo-modal__title">Request a Demo</h2>
    <p class="demo-modal__sub">See how <strong>sense</strong> keeps your fleet on the road. Tell us a little and we'll be in touch.</p>
    <form class="demo-form" novalidate>
      <div class="demo-field"><label for="df-name">Name</label><input id="df-name" name="name" type="text" required autocomplete="name"></div>
      <div class="demo-field"><label for="df-company">Company / Fleet</label><input id="df-company" name="company" type="text" required autocomplete="organization"></div>
      <div class="demo-field"><label for="df-email">Work email</label><input id="df-email" name="email" type="email" required autocomplete="email"></div>
      <div class="demo-field"><label for="df-phone">Phone <span>(optional)</span></label><input id="df-phone" name="phone" type="tel" autocomplete="tel"></div>
      <div class="demo-field"><label for="df-message">Fleet size / message <span>(optional)</span></label><textarea id="df-message" name="message" rows="3"></textarea></div>
      <input class="demo-hp" type="text" name="company_url" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="demo-form__msg" role="alert" hidden></div>
      <button class="demo-submit" type="submit">Request a Demo</button>
    </form>
  </div>`;
document.body.appendChild(overlay);

const form = overlay.querySelector('.demo-form');
const card = overlay.querySelector('.demo-modal__card');
const msg = overlay.querySelector('.demo-form__msg');
const submitBtn = overlay.querySelector('.demo-submit');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showMsg(text) {
  msg.textContent = text;
  msg.classList.add('is-error');
  msg.hidden = false;
}
function clearMsg() {
  msg.hidden = true;
  msg.classList.remove('is-error');
}

function open(e) {
  if (e) e.preventDefault();
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
  // Lock scroll via the shared lock: blocks wheel/key AND scrollbar-drag behind the modal.
  window.lockScroll();
  setTimeout(() => overlay.querySelector('#df-name')?.focus(), 60);
}
function close() {
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  window.unlockScroll();
}

// Open from either CTA (nav link + sc8 closing button). preventDefault
// neutralises the nav link's legacy #s8 href.
document.querySelectorAll('.nav-demo, #closingCta').forEach((el) =>
  el.addEventListener('click', open)
);
overlay.querySelectorAll('[data-demo-close]').forEach((el) =>
  el.addEventListener('click', close)
);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMsg();
  const data = Object.fromEntries(new FormData(form).entries());

  if (!data.name?.trim() || !data.company?.trim() || !data.email?.trim()) {
    showMsg('Please fill in your name, company and email.');
    return;
  }
  if (!EMAIL_RE.test(data.email.trim())) {
    showMsg('Please enter a valid email address.');
    return;
  }

  submitBtn.disabled = true;
  const label = submitBtn.textContent;
  submitBtn.textContent = 'Sending…';
  try {
    const res = await fetch('/api/demo-request', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.ok) {
      card.innerHTML =
        '<button class="demo-modal__close" type="button" data-demo-close aria-label="Close">&times;</button>' +
        '<div class="demo-success"><h2>Thank you.</h2><p>Your request has reached the <strong>sense</strong> team. We\'ll be in touch shortly.</p></div>';
      card.querySelector('[data-demo-close]').addEventListener('click', close);
    } else {
      showMsg(json.error || 'Something went wrong. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = label;
    }
  } catch {
    showMsg('Network error. Please check your connection and try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = label;
  }
});
