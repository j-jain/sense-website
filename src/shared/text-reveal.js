/* ══════════════════════════════════════════════
   text-reveal.js — sofihealth-style letter reveal (site-wide)
   ------------------------------------------------
   Splits an element's text into per-character spans and reveals them
   rising from a clipped baseline, left → right, with a small stagger.
   Dependency-free (no GSAP SplitText plugin). Uses the global `gsap`
   that shared/setup.js puts on window.

   This is the SHARED copy used by the production scenes. The standalone
   prototype keeps its own copy at src/proto/text-reveal.js.

   API:
     splitText(el)            → wraps each char; idempotent; returns char nodes
     revealText(el, opts)     → split (if needed) + reveal; sets wrapper opacity:1
     revealChars(el, opts)    → like revealText but NEVER writes el.style.opacity
                                (use when the wrapper rests at a custom opacity)
     prepText(el, opts)       → split + set the hidden pre-roll state (no play)
   opts: { duration=0.7, stagger=0.018, delay=0, ease='power3.out', y=110 }

   Reduced motion: when the user prefers reduced motion, every entry point
   shows the text fully formed with NO per-letter animation, and never leaves
   a heading stuck in the hidden pre-roll state.
══════════════════════════════════════════════ */

const SPLIT_FLAG = 'trSplit';
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Wrap each character of `el` in <span class="tr-ch"> inside a
   <span class="tr-mask"> (overflow:hidden) so the glyph can rise from
   below its own baseline. Honors <br> as a hard line break and keeps
   words intact (no mid-word wrapping). */
export function splitText(el) {
  if (!el || el.dataset[SPLIT_FLAG] === '1') {
    return el ? Array.from(el.querySelectorAll('.tr-ch')) : [];
  }

  // Split on <br> first so explicit line breaks survive.
  const lines = el.innerHTML.split(/<br\s*\/?>/i);
  el.innerHTML = '';

  lines.forEach((line, li) => {
    if (li > 0) el.appendChild(document.createElement('br'));
    // Strip any stray tags; we only reveal plain text.
    const text = line.replace(/<[^>]*>/g, '');
    const words = text.split(/(\s+)/); // keep whitespace tokens
    words.forEach((word) => {
      if (/^\s+$/.test(word) || word === '') {
        // Render whitespace as a gap that does NOT animate.
        if (word !== '') el.appendChild(document.createTextNode(' '));
        return;
      }
      // One inline-block per word so it never breaks across a line.
      const wordWrap = document.createElement('span');
      wordWrap.className = 'tr-word';
      for (const ch of word) {
        const mask = document.createElement('span');
        mask.className = 'tr-mask';
        const inner = document.createElement('span');
        inner.className = 'tr-ch';
        inner.textContent = ch;
        mask.appendChild(inner);
        wordWrap.appendChild(mask);
      }
      el.appendChild(wordWrap);
    });
  });

  el.dataset[SPLIT_FLAG] = '1';
  return Array.from(el.querySelectorAll('.tr-ch'));
}

/* Split + set the pre-roll (hidden, pushed down) state without playing.
   Reduced motion: split but leave chars fully shown so nothing is ever
   stuck hidden; don't force the wrapper opacity (let CSS / the caller own it). */
export function prepText(el, opts = {}) {
  const chars = splitText(el);
  if (!window.gsap) return chars;
  if (REDUCED) {
    window.gsap.set(chars, { yPercent: 0, opacity: 1 });
    return chars;
  }
  const y = opts.y ?? 110;
  window.gsap.set(chars, { yPercent: y, opacity: 0 });
  el.style.opacity = '1'; // element wrapper visible; chars carry the hidden state
  return chars;
}

/* Internal: split + reveal the characters rising left → right.
   `touchWrapper` controls whether we force el.style.opacity = '1'. */
function play(el, opts, touchWrapper) {
  const {
    duration = 0.7,
    stagger = 0.018,
    delay = 0,
    ease = 'power3.out',
    y = 110,
  } = opts;

  const chars = splitText(el);
  if (touchWrapper) el.style.opacity = '1';
  if (!window.gsap) return null;

  if (REDUCED) {
    window.gsap.set(chars, { yPercent: 0, opacity: 1 });
    return null;
  }

  window.gsap.set(chars, { yPercent: y, opacity: 0 });
  return window.gsap.to(chars, {
    yPercent: 0,
    opacity: 1,
    duration,
    ease,
    delay,
    stagger, // DOM order is already left→right, top→bottom
  });
}

/* Split (if needed) + reveal; makes the wrapper fully opaque. */
export function revealText(el, opts = {}) {
  return play(el, opts, true);
}

/* Like revealText, but never touches el.style.opacity — for headings whose
   wrapper rests at a custom opacity (e.g. S5C's 0.65 dimmed headline). */
export function revealChars(el, opts = {}) {
  return play(el, opts, false);
}
