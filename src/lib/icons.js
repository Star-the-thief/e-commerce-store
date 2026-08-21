'use strict';

/**
 * One consistent line-style icon set, 1.5px stroke (Spec 3.4).
 * Every icon shares the same 24x24 grid, stroke width, and cap/join style so
 * nothing on the site mixes icon languages. Sizing/colour comes from CSS
 * (.icon, .icon--sm/lg/xl) — never inline.
 */
const PATHS = {
  // Navigation & chrome
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4.3-4.3"/>',
  cart:
    '<path d="M3 5h2.2l1.6 10.2a2 2 0 0 0 2 1.7h7.9a2 2 0 0 0 2-1.6L20 8H6.4"/>' +
    '<circle cx="9.5" cy="20" r="1.2"/><circle cx="17" cy="20" r="1.2"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  chevronLeft: '<path d="m15 6-6 6 6 6"/>',
  arrowRight: '<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  sliders:
    '<path d="M4 8h10M18 8h2M4 16h4M12 16h8"/><circle cx="16" cy="8" r="2"/><circle cx="10" cy="16" r="2"/>',

  // Trust, delivery & status
  truck:
    '<path d="M3 7h10v9H3z"/><path d="M13 10h4l3 3v3h-7z"/>' +
    '<circle cx="6.5" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
  refresh:
    '<path d="M20 11a8 8 0 0 0-13.7-4.9L4 8"/><path d="M4 4v4h4"/>' +
    '<path d="M4 13a8 8 0 0 0 13.7 4.9L20 16"/><path d="M20 20v-4h-4"/>',
  cash:
    '<rect x="2.5" y="6.5" width="19" height="11" rx="2"/>' +
    '<circle cx="12" cy="12" r="2.4"/><path d="M6 10v4M18 10v4"/>',
  card:
    '<rect x="2.5" y="5.5" width="19" height="13" rx="2"/>' +
    '<path d="M2.5 10h19M6 15h4"/>',
  shield:
    '<path d="M12 3l7 3v5.5c0 4.2-2.9 7.8-7 9.5-4.1-1.7-7-5.3-7-9.5V6z"/>' +
    '<path d="m9 12 2.2 2.2L15.5 10"/>',
  check: '<path d="m5 13 4.5 4.5L19 7"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.6 2.6L16 9.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  alert:
    '<path d="M12 4l8.5 15H3.5z"/><path d="M12 10v4M12 17h.01"/>',
  sparkle:
    '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>' +
    '<path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
  gift:
    '<rect x="3" y="8.5" width="18" height="11.5" rx="1.5"/><path d="M3 13h18M12 8.5V20"/>' +
    '<path d="M12 8.5S10.5 4 8 4a2.2 2.2 0 0 0 0 4.5zM12 8.5S13.5 4 16 4a2.2 2.2 0 0 1 0 4.5z"/>',
  tag:
    '<path d="M12.6 3.4H20V11l-8.6 8.6a2 2 0 0 1-2.8 0L3.4 14a2 2 0 0 1 0-2.8z"/>' +
    '<circle cx="16.4" cy="7" r="1.2"/>',

  // Contact
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.8 7 8.2 6 8.2-6"/>',
  phone:
    '<path d="M7.2 3.5h2.3l1.2 3.4-1.8 1.3a11.5 11.5 0 0 0 5.4 5.4l1.3-1.8 3.4 1.2v2.3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 5.2 5.7a2 2 0 0 1 2-2.2z"/>',
  whatsapp:
    '<path d="M20 12a8 8 0 0 1-11.9 7L4 20l1.1-4A8 8 0 1 1 20 12z"/>' +
    '<path d="M9.2 9.6c0 3 2.2 5.2 5.2 5.2.6 0 1-.5 1-1l-1.4-.7-.9.8a5 5 0 0 1-2-2l.8-.9-.7-1.4c-.5 0-1 .4-1 1z"/>',
  pin: '<path d="M12 21s6.5-5.6 6.5-10.5a6.5 6.5 0 0 0-13 0C5.5 15.4 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
  map:
    '<path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"/><path d="M9 4v13.5M15 6.5V20"/>',
  box:
    '<path d="M3 8l9-5 9 5-9 5-9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8M3 8l9 5 9-5"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/>' +
    '<path d="M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9s1.3-6.5 3.8-9Z"/>',

  // Content
  ruler:
    '<path d="M3 15.5 15.5 3 21 8.5 8.5 21z"/><path d="m7.5 13 2 2M11 9.5l2 2M14.5 6l2 2"/>',
  leaf:
    '<path d="M20 4C10 4 5 8.5 5 14.5A5.5 5.5 0 0 0 10.5 20C16.5 20 20 14 20 4z"/><path d="M11 18c0-4 2.5-7.5 6-10"/>',
  droplet: '<path d="M12 3.5s6 6.2 6 10a6 6 0 0 1-12 0c0-3.8 6-10 6-10z"/>',
  scissors:
    '<circle cx="6.5" cy="6.5" r="2.5"/><circle cx="6.5" cy="17.5" r="2.5"/>' +
    '<path d="M8.7 8.3 20 18M20 6 8.7 15.7"/>',
  hanger:
    '<path d="M12 7a2.2 2.2 0 1 1 2.2-2.2"/><path d="M12 7v2.2L3.5 15A1.4 1.4 0 0 0 4.3 17.5h15.4a1.4 1.4 0 0 0 .8-2.5L12 9.2"/>',
  palette:
    '<path d="M12 3a9 9 0 0 0 0 18c1.4 0 2-1 2-2s-.7-2-.7-2.8c0-1 .8-1.7 1.9-1.7H18a3 3 0 0 0 3-3A9.3 9.3 0 0 0 12 3z"/>' +
    '<circle cx="8" cy="10" r="1.1"/><circle cx="12" cy="7.5" r="1.1"/><circle cx="16" cy="10" r="1.1"/>',
  bag:
    '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  trash:
    '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',
  zoom:
    '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4.3-4.3M8.5 11h5M11 8.5v5"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  file:
    '<path d="M6 3h7l5 5v13H6z"/><path d="M13 3v5h5"/><path d="M9 13h6M9 17h6"/>',
  lock:
    '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/>',
  instagram:
    '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><path d="M16.8 7.2h.01"/>',
  facebook:
    '<path d="M14.5 8.5h2V5.5h-2a3.5 3.5 0 0 0-3.5 3.5V11H9v3h2v6h3v-6h2.2l.5-3H14V9.3c0-.5.2-.8.5-.8z"/>',
  tiktok:
    '<path d="M14 4v9.2a3.2 3.2 0 1 1-3.2-3.2"/><path d="M14 4c.4 2.2 1.9 3.6 4 3.8"/>',
};

function icon(name, cls) {
  const body = PATHS[name];
  if (!body) throw new Error(`Unknown icon: ${name}`);
  return (
    `<svg class="${cls || 'icon'}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">` +
    body +
    '</svg>'
  );
}

module.exports = { icon, PATHS };
