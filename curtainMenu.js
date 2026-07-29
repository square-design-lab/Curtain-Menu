/* ==========================================================================
   SDL Curtain Menu v1.0  —  curtainMenu.js
   GSAP staggered-curtain hamburger menu for Squarespace 7.1
   Square Design Lab

   Reads window.SDL_CURTAIN_MENU_CONFIG. Builds its own overlay from the
   site's native navigation, suppresses Squarespace's mobile menu, and keeps
   the native burger button (including its X animation) as the toggle.
   ========================================================================== */
(function () {
  'use strict';

  if (window.SDL_CURTAIN_MENU_LOADED) return;
  window.SDL_CURTAIN_MENU_LOADED = true;

  var GSAP_SRC = 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js';

  /* ------------------------------------------------------------------------
     Defaults
     ------------------------------------------------------------------------ */
  var DEFAULTS = {
    enable: true,

    /* take-over */
    desktopBurger: true,      // show the burger + hide the inline nav on desktop
    desktopMinWidth: 768,     // px — take over at or above this width
    takeOverMobile: true,     // also replace the native menu below that width
    burgerAlign: 'default',   // default | right | left

    /* panel */
    side: 'right',            // right | left | full
    width: '46vw',
    maxWidth: 720,
    radius: 28,
    padX: '5vw',
    padTop: 140,
    padBottom: 48,
    widthMobile: '100%',
    padXMobile: '7vw',
    padTopMobile: 110,
    itemGap: 0,               // extra space between top-level rows
    footerGap: 40,            // space above the footer block

    /* curtains — the last colour is the resting menu background */
    curtains: ['#FF4C24', '#FFFFFF', '#E3E1DE'],
    scrimColor: '#131313',
    scrimOpacity: 0.4,

    /* motion */
    duration: 0.7,
    ease: [0.65, 0.01, 0.05, 0.99],
    curtainStagger: 0.12,
    curtainDuration: 0.575,
    linkStagger: 0.05,
    linkDelay: 0.35,
    linkEntrance: 'riseRotate', // riseRotate | rise | fade | blur | scale
    fadeStagger: 0.04,

    /* type — 'auto' samples the live site header so the menu matches it */
    align: 'left',            // left | center | right
    fontSource: 'headerNav',  // headerNav | siteHeading | custom
    fontFamily: 'auto',       // 'auto' = take it from fontSource
    fontSize: 64,
    fontSizeMobile: 34,
    fontWeight: 700,
    letterSpacing: -0.02,
    lineHeight: 1.02,
    textTransform: 'uppercase',
    textColor: 'auto',        // 'auto' = take the header nav's colour
    linkPaddingY: 10,

    /* hover */
    hoverEffect: 'wipe',      // wipe | rollup | charRoll | slide | underline | fill | outline | none
    hoverTextColor: '#FFFFFF',
    hoverBgColor: '#131313',

    /* numbers */
    showNumbers: true,
    numberColor: '#FF4C24',
    numberFormat: 'pad',      // pad | plain
    numberPosition: 'after',  // after | before

    /* close control inside the panel */
    closeButton: true,
    closeStyle: 'text',       // text | icon
    closeLabel: 'Close',
    closeSize: 26,            // icon size in px
    closeColor: '',           // '' inherits textColor

    /* submenu */
    submenuEnabled: true,
    submenuIcon: 'plus',      // plus | chevron | caret | arrow
    submenuIconPosition: 'inline', // inline | edge
    submenuFontSize: 20,
    submenuColor: 'auto',
    submenuIndent: 24,
    submenuDuration: 0.5,
    submenuAutoClose: true,
    submenuLinkStagger: 0.035,

    /* what stays in the site header alongside the burger */
    keepHeaderActions: true,  // social icons, buttons, cart, account — left in place
    keepHeaderCart: true,

    /* footer */
    showSocials: true,        // mirror the site's social icons inside the panel
    showHeaderButton: true,   // mirror the header button(s) inside the panel
    footerText: '',
    footerLinks: [],          // [{ label: 'hello@site.com', url: 'mailto:…' }]

    /* behaviour */
    closeOnEsc: true,
    closeOnLinkClick: true,
    closeOnScrim: true,
    lockScroll: true,

    /* nav source override */
    navSelector: ''
  };

  var cfg = merge(DEFAULTS, window.SDL_CURTAIN_MENU_CONFIG || {});

  /* ------------------------------------------------------------------------
     Small helpers
     ------------------------------------------------------------------------ */
  function merge(base, over) {
    var out = {}, k;
    for (k in base) if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
    for (k in over) if (Object.prototype.hasOwnProperty.call(over, k) && over[k] !== undefined && over[k] !== null) out[k] = over[k];
    return out;
  }

  function el(tag, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) for (var a in attrs) if (attrs[a] !== null && attrs[a] !== undefined) n.setAttribute(a, attrs[a]);
    return n;
  }

  function unit(v, fallback) {
    if (v === null || v === undefined || v === '') return fallback;
    if (typeof v === 'number') return v + 'px';
    return String(v).match(/^-?[\d.]+$/) ? v + 'px' : String(v);
  }

  function hexToRgba(hex, alpha) {
    var h = String(hex || '#000').replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return 'rgba(0,0,0,' + alpha + ')';
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + alpha + ')';
  }

  /* --- colour maths, used to keep sampled colours legible ----------------- */
  function toRgb(c) {
    c = String(c || '').trim();
    var m = c.match(/^rgba?\(([^)]+)\)$/i);
    if (m) {
      var p = m[1].split(',').map(parseFloat);
      return { r: p[0], g: p[1], b: p[2] };
    }
    var h = c.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (isNaN(n) || h.length !== 6) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function luminance(c) {
    var rgb = toRgb(c);
    if (!rgb) return 0;
    var v = ['r', 'g', 'b'].map(function (k) {
      var x = rgb[k] / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }

  function contrast(a, b) {
    var la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  /* Header colours are sampled against the header's own background, which is
     rarely the menu's. Fall back to plain black/white when they clash. */
  function legible(fg, bg) {
    if (!toRgb(fg)) return null;
    if (contrast(fg, bg) >= 3) return fg;
    return luminance(bg) > 0.45 ? '#131313' : '#FFFFFF';
  }

  /* A cubic-bezier timing function, so the CustomEase plugin isn't needed. */
  function bezier(p1x, p1y, p2x, p2y) {
    function A(a, b) { return 1 - 3 * b + 3 * a; }
    function B(a, b) { return 3 * b - 6 * a; }
    function C(a) { return 3 * a; }
    function calc(t, a, b) { return ((A(a, b) * t + B(a, b)) * t + C(a)) * t; }
    function slope(t, a, b) { return 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a); }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var t = x, i, d;
      for (i = 0; i < 8; i++) {
        d = slope(t, p1x, p2x);
        if (d === 0) break;
        t -= (calc(t, p1x, p2x) - x) / d;
      }
      return calc(t, p1y, p2y);
    };
  }

  /* ------------------------------------------------------------------------
     Editor detection

     Squarespace renders the site inside an iframe while you edit, so the
     iframe check is the reliable signal — the edit-mode classes land on the
     body only after the editor finishes booting.
     ------------------------------------------------------------------------ */
  function inEditor() {
    var b = document.body, d = document.documentElement;

    if (/\/config(\/|$)/.test(location.pathname)) return true;
    if (location.search.indexOf('isEditingPage') > -1) return true;

    if (b && (b.classList.contains('sqs-edit-mode') ||
              b.classList.contains('sqs-edit-mode-active'))) return true;
    if (d && d.classList.contains('sqs-edit-mode')) return true;
    if (document.querySelector('.sqs-editing-overlay, .sqs-block-editor')) return true;

    /* Any iframe embedding — the editor, and previews generally. */
    try { if (window.self !== window.top) return true; }
    catch (e) { return true; }   /* cross-origin frame → treat as editor */

    return false;
  }

  /* Sample the live header so the menu inherits the site's own typography. */
  function sampleHeader() {
    var navLink = document.querySelector('.header-nav-item a') ||
                  document.querySelector('.header-nav-folder-title') ||
                  document.querySelector('.header-menu-nav-item a') ||
                  document.querySelector('.header-title-text a');
    var heading = document.querySelector('h1, h2, .sqsrte-large');

    var out = { font: '', headingFont: '', color: '', weight: '', tracking: '' };

    if (navLink) {
      var cs = getComputedStyle(navLink);
      out.font = cs.fontFamily;
      out.color = cs.color;
      out.weight = cs.fontWeight;
      out.tracking = cs.letterSpacing;
    }
    if (heading) out.headingFont = getComputedStyle(heading).fontFamily;

    return out;
  }

  /* ------------------------------------------------------------------------
     Icons
     ------------------------------------------------------------------------ */
  var ICONS = {
    plus:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
    caret:   '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 15.5 5.5 9h13z"/></svg>',
    close:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    arrow:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>',
    diagArrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };

  /* ------------------------------------------------------------------------
     Read the site navigation
     ------------------------------------------------------------------------ */
  function readNav() {
    var src = cfg.navSelector ? document.querySelector(cfg.navSelector) : null;
    if (!src) {
      src = document.querySelector('.header-display-desktop .header-nav-list') ||
            document.querySelector('.header-nav-list') ||
            document.querySelector('.header-menu-nav-list');
    }
    if (!src) return [];

    var items = [];
    var nodes = src.querySelectorAll(':scope > .header-nav-item, :scope > div > .header-nav-item');

    Array.prototype.forEach.call(nodes, function (node) {
      var isFolder = node.classList.contains('header-nav-item--folder');

      if (isFolder && cfg.submenuEnabled) {
        var titleEl = node.querySelector('.header-nav-folder-title-text') ||
                      node.querySelector('.header-nav-folder-title');
        var folderLink = node.querySelector('a.header-nav-folder-title');
        var children = [];

        Array.prototype.forEach.call(node.querySelectorAll('.header-nav-folder-item a'), function (a) {
          var span = a.querySelector('.header-nav-folder-item-content');
          children.push({
            label: (span ? span.textContent : a.textContent).trim(),
            href: a.getAttribute('href') || '#',
            target: a.getAttribute('target') || null,
            active: a.closest('.header-nav-folder-item') &&
                    a.closest('.header-nav-folder-item').classList.contains('header-nav-folder-item--active')
          });
        });

        items.push({
          label: titleEl ? titleEl.textContent.trim() : '',
          href: folderLink ? folderLink.getAttribute('href') : null,
          folder: true,
          children: children,
          active: node.classList.contains('header-nav-item--active')
        });
        return;
      }

      /* Folder rendered flat when submenus are disabled */
      if (isFolder) {
        var t = node.querySelector('.header-nav-folder-title-text');
        var fl = node.querySelector('a.header-nav-folder-title');
        if (t) items.push({ label: t.textContent.trim(), href: fl ? fl.getAttribute('href') : '#', folder: false, children: [] });
        return;
      }

      var link = node.querySelector('a');
      if (!link) return;
      items.push({
        label: link.textContent.trim(),
        href: link.getAttribute('href') || '#',
        target: link.getAttribute('target') || null,
        folder: false,
        children: [],
        active: node.classList.contains('header-nav-item--active')
      });
    });

    return items;
  }

  /* Squarespace parks social icons in different wrappers depending on header
     layout and version — take the first candidate that actually has links. */
  function readSocials() {
    var candidates = [
      '.header-actions-action--social',
      '.header-menu-actions .social-accounts',
      '.header-actions .social-accounts',
      '.header-menu-actions-action--social',
      '#footer-sections .sqs-svg-icon--list',
      '.sqs-svg-icon--list'
    ];

    for (var i = 0; i < candidates.length; i++) {
      var box = document.querySelector(candidates[i]);
      if (!box || !box.querySelectorAll('a').length) continue;

      var clone = box.cloneNode(true);
      Array.prototype.forEach.call(clone.querySelectorAll('[id]'), function (n) {
        n.removeAttribute('id');
      });
      /* Drop Squarespace's own sizing/colour classes so our styles win. */
      Array.prototype.forEach.call(clone.querySelectorAll('a'), function (a) {
        a.className = 'sdl-cm__social';
      });
      clone.className = 'sdl-cm__socials-inner';
      return clone;
    }
    return null;
  }

  /* ------------------------------------------------------------------------
     Build markup
     ------------------------------------------------------------------------ */
  function splitChars(text) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < text.length; i++) {
      var c = el('span', 'sdl-cm__char');
      c.style.setProperty('--i', i);
      c.textContent = text[i];
      frag.appendChild(c);
    }
    return frag;
  }

  function buildLabel(text) {
    var wants = cfg.hoverEffect === 'rollup' || cfg.hoverEffect === 'charRoll';
    var span = el('span', 'sdl-cm__text');

    if (!wants) {
      span.textContent = text;
      return span;
    }

    var roll = el('span', 'sdl-cm__roll');
    var a = el('span', 'sdl-cm__roll-a');
    var b = el('span', 'sdl-cm__roll-b', { 'aria-hidden': 'true' });

    if (cfg.hoverEffect === 'charRoll') {
      a.appendChild(splitChars(text));
      b.appendChild(splitChars(text));
    } else {
      a.textContent = text;
      b.textContent = text;
    }
    roll.appendChild(a);
    roll.appendChild(b);
    span.appendChild(roll);
    return span;
  }

  function buildNumber(index) {
    if (!cfg.showNumbers) return null;
    var n = index + 1;
    var txt = cfg.numberFormat === 'pad' ? (n < 10 ? '0' + n : String(n)) : String(n);
    var s = el('span', 'sdl-cm__num' + (cfg.numberPosition === 'before' ? ' sdl-cm__num--before' : ''), { 'aria-hidden': 'true' });
    s.textContent = txt;
    return s;
  }

  function buildItem(data, index) {
    var li = el('li', 'sdl-cm__item' + (data.folder ? ' sdl-cm__item--folder' : ''));
    var row = el('span', 'sdl-cm__row');
    var isFolder = data.folder && data.children.length;

    var link;
    if (isFolder) {
      link = el('button', 'sdl-cm__link sdl-cm__link--folder', {
        type: 'button',
        'aria-expanded': 'false'
      });
    } else {
      link = el('a', 'sdl-cm__link', { href: data.href || '#' });
      if (data.target) link.setAttribute('target', data.target);
    }
    if (data.active) link.classList.add('is-active');

    link.appendChild(el('span', 'sdl-cm__wipe', { 'aria-hidden': 'true' }));
    link.appendChild(buildLabel(data.label));

    if (cfg.hoverEffect === 'slide' && !isFolder) {
      var arrow = el('span', 'sdl-cm__arrow', { 'aria-hidden': 'true' });
      arrow.innerHTML = ICONS.diagArrow;
      link.appendChild(arrow);
    }

    var num = buildNumber(index);
    if (num) link.appendChild(num);

    if (isFolder) {
      var icon = el('span', 'sdl-cm__icon sdl-cm__icon--' + cfg.submenuIcon, { 'aria-hidden': 'true' });
      icon.innerHTML = ICONS[cfg.submenuIcon] || ICONS.plus;
      link.appendChild(icon);
    }

    row.appendChild(link);
    li.appendChild(row);

    if (isFolder) {
      var sub = el('div', 'sdl-cm__sub');
      var ul = el('ul', 'sdl-cm__sub-list');
      data.children.forEach(function (child) {
        var cli = el('li', 'sdl-cm__sub-item');
        var ca = el('a', 'sdl-cm__sub-link' + (child.active ? ' is-active' : ''), { href: child.href });
        if (child.target) ca.setAttribute('target', child.target);
        ca.textContent = child.label;
        cli.appendChild(ca);
        ul.appendChild(cli);
      });
      sub.appendChild(ul);
      li.appendChild(sub);
    }

    return li;
  }

  /* Clone the header's call-to-action button(s) so they stay reachable when a
     full-width panel covers the real header. */
  function readHeaderButtons() {
    var found = document.querySelectorAll(
      '.header-actions .header-actions-action--cta a, ' +
      '.header-menu-cta a, ' +
      '.header-actions .sqs-button-element--primary'
    );
    if (!found.length) return null;
    var wrap = el('div', 'sdl-cm__cta');
    var seen = {};
    Array.prototype.forEach.call(found, function (a) {
      var href = a.getAttribute('href') || '';
      var text = a.textContent.trim();
      if (!text || seen[href + text]) return;
      seen[href + text] = 1;
      var c = el('a', 'sdl-cm__cta-btn', { href: href || '#' });
      if (a.getAttribute('target')) c.setAttribute('target', a.getAttribute('target'));
      c.textContent = text;
      wrap.appendChild(c);
    });
    return wrap.children.length ? wrap : null;
  }

  function buildFooter() {
    var parts = [];

    if (cfg.showHeaderButton) {
      var cta = readHeaderButtons();
      if (cta) {
        cta.classList.add('sdl-cm__fade');
        cta.setAttribute('data-cm-fade', '');
        parts.push(cta);
      }
    }

    if (cfg.footerText) {
      var p = el('p', 'sdl-cm__foot-text sdl-cm__fade');
      p.setAttribute('data-cm-fade', '');
      p.textContent = cfg.footerText;
      parts.push(p);
    }

    if (cfg.footerLinks && cfg.footerLinks.length) {
      var wrap = el('div', 'sdl-cm__foot-links sdl-cm__fade');
      wrap.setAttribute('data-cm-fade', '');
      cfg.footerLinks.forEach(function (l) {
        if (!l || !l.label) return;
        var a = el('a', 'sdl-cm__foot-link', { href: l.url || '#' });
        a.textContent = l.label;
        wrap.appendChild(a);
      });
      if (wrap.children.length) parts.push(wrap);
    }

    if (cfg.showSocials) {
      var soc = readSocials();
      if (soc) {
        var box = el('div', 'sdl-cm__socials sdl-cm__fade');
        box.setAttribute('data-cm-fade', '');
        box.appendChild(soc);
        parts.push(box);
      }
    }

    if (!parts.length) return null;
    var foot = el('div', 'sdl-cm__foot');
    parts.forEach(function (n) { foot.appendChild(n); });
    return foot;
  }

  function buildCloseButton() {
    if (!cfg.closeButton) return null;
    var btn = el('button', 'sdl-cm__close sdl-cm__close--' + cfg.closeStyle, {
      type: 'button',
      'data-cm-close': '',
      'aria-label': 'Close menu'
    });
    if (cfg.closeStyle === 'text' && cfg.closeLabel) {
      var lab = el('span', 'sdl-cm__close-label');
      lab.textContent = cfg.closeLabel;
      btn.appendChild(lab);
    }
    var ico = el('span', 'sdl-cm__close-icon', { 'aria-hidden': 'true' });
    ico.innerHTML = ICONS.close;
    btn.appendChild(ico);
    return btn;
  }

  function buildOverlay(items) {
    var root = el('div', 'sdl-cm', {
      'data-nav': 'closed',
      'data-side': cfg.side,
      'data-align': cfg.align,
      'data-hover': cfg.hoverEffect,
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Site menu'
    });

    var scrim = el('div', 'sdl-cm__scrim', { 'data-cm-close': '' });
    root.appendChild(scrim);

    var panel = el('nav', 'sdl-cm__panel', { 'aria-label': 'Main navigation' });

    var curtains = el('div', 'sdl-cm__curtains', { 'aria-hidden': 'true' });
    (cfg.curtains || []).forEach(function (c) {
      var layer = el('div', 'sdl-cm__curtain');
      layer.style.background = c;
      curtains.appendChild(layer);
    });
    panel.appendChild(curtains);

    var closeBtn = buildCloseButton();
    if (closeBtn) panel.appendChild(closeBtn);

    var scroll = el('div', 'sdl-cm__scroll');

    var list = el('ul', 'sdl-cm__list');
    items.forEach(function (d, i) { list.appendChild(buildItem(d, i)); });
    scroll.appendChild(list);

    var foot = buildFooter();
    if (foot) scroll.appendChild(foot);

    panel.appendChild(scroll);
    root.appendChild(panel);
    return root;
  }

  /* ------------------------------------------------------------------------
     Apply config to CSS variables
     ------------------------------------------------------------------------ */
  function applyVars() {
    var s = document.documentElement.style;
    var last = (cfg.curtains && cfg.curtains.length) ? cfg.curtains[cfg.curtains.length - 1] : '#E3E1DE';
    var site = sampleHeader();

    /* Resolve the 'auto' sentinels against the live header. */
    var font = cfg.fontFamily;
    if (font === 'auto' || font === '') {
      font = cfg.fontSource === 'siteHeading'
        ? (site.headingFont || site.font)
        : (site.font || site.headingFont);
    }
    var textColor = cfg.textColor;
    if (textColor === 'auto') {
      textColor = legible(site.color, last) || '#131313';
    }
    var subColor  = cfg.submenuColor === 'auto' ? textColor : cfg.submenuColor;

    s.setProperty('--sdlcm-width', unit(cfg.width, '46vw'));
    s.setProperty('--sdlcm-max-width', unit(cfg.maxWidth, '720px'));
    s.setProperty('--sdlcm-radius', unit(cfg.radius, '28px'));
    s.setProperty('--sdlcm-pad-x', unit(cfg.padX, '5vw'));
    s.setProperty('--sdlcm-pad-top', unit(cfg.padTop, '140px'));
    s.setProperty('--sdlcm-pad-bottom', unit(cfg.padBottom, '48px'));
    s.setProperty('--sdlcm-width-mobile', unit(cfg.widthMobile, '100%'));
    s.setProperty('--sdlcm-pad-x-mobile', unit(cfg.padXMobile, '7vw'));
    s.setProperty('--sdlcm-pad-top-mobile', unit(cfg.padTopMobile, '110px'));
    s.setProperty('--sdlcm-item-gap', unit(cfg.itemGap, '0px'));
    s.setProperty('--sdlcm-footer-gap', unit(cfg.footerGap, '40px'));

    s.setProperty('--sdlcm-overlay', hexToRgba(cfg.scrimColor, cfg.scrimOpacity));
    s.setProperty('--sdlcm-bg', last);

    s.setProperty('--sdlcm-text', textColor);
    s.setProperty('--sdlcm-hover-text', cfg.hoverTextColor);
    s.setProperty('--sdlcm-hover-bg', cfg.hoverBgColor);
    s.setProperty('--sdlcm-num', cfg.numberColor);

    if (font) s.setProperty('--sdlcm-font', font);
    s.setProperty('--sdlcm-size', unit(cfg.fontSize, '64px'));
    s.setProperty('--sdlcm-size-mobile', unit(cfg.fontSizeMobile, '34px'));
    s.setProperty('--sdlcm-weight', cfg.fontWeight);
    s.setProperty('--sdlcm-tracking', cfg.letterSpacing + 'em');
    s.setProperty('--sdlcm-leading', cfg.lineHeight);
    s.setProperty('--sdlcm-transform', cfg.textTransform);
    s.setProperty('--sdlcm-link-pad-y', unit(cfg.linkPaddingY, '10px'));

    s.setProperty('--sdlcm-sub-size', unit(cfg.submenuFontSize, '20px'));
    s.setProperty('--sdlcm-sub-color', subColor);
    s.setProperty('--sdlcm-sub-indent', unit(cfg.submenuIndent, '24px'));
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  function loadGsap(done) {
    if (window.gsap) return done();
    var existing = document.querySelector('script[data-sdl-gsap]');
    if (existing) { existing.addEventListener('load', done); return; }
    var s = document.createElement('script');
    s.src = GSAP_SRC;
    s.setAttribute('data-sdl-gsap', '');
    s.onload = done;
    s.onerror = function () { console.warn('[SDL Curtain Menu] GSAP failed to load.'); };
    document.head.appendChild(s);
  }

  function init() {
    if (!cfg.enable || inEditor()) return;

    var burgerBtn = document.querySelector('.header-burger-btn');
    if (!burgerBtn) { console.warn('[SDL Curtain Menu] No .header-burger-btn found.'); return; }

    var items = readNav();
    if (!items.length) { console.warn('[SDL Curtain Menu] No navigation items found.'); return; }

    applyVars();

    var root = buildOverlay(items);
    document.body.appendChild(root);

    var html = document.documentElement;
    html.classList.add('sdl-cm-active');
    if (cfg.burgerAlign === 'left')  html.classList.add('sdl-cm-burger-left');
    if (cfg.burgerAlign === 'right') html.classList.add('sdl-cm-burger-right');
    if (!cfg.keepHeaderActions) html.classList.add('sdl-cm-hide-actions');
    if (!cfg.keepHeaderCart)    html.classList.add('sdl-cm-hide-cart');

    var scrim    = root.querySelector('.sdl-cm__scrim');
    var panel    = root.querySelector('.sdl-cm__panel');
    var layers   = root.querySelectorAll('.sdl-cm__curtain');
    var links    = root.querySelectorAll('.sdl-cm__link');
    var fades    = root.querySelectorAll('[data-cm-fade]');
    var closeBtn = root.querySelector('.sdl-cm__close');
    var scroller = root.querySelector('.sdl-cm__scroll');

    if (cfg.submenuIconPosition === 'edge') root.setAttribute('data-icon-pos', 'edge');
    if (cfg.closeColor) root.style.setProperty('--sdlcm-close-color', cfg.closeColor);
    root.style.setProperty('--sdlcm-close-size', unit(cfg.closeSize, '26px'));

    /* A stale burger--active can survive a bfcache restore — start clean. */
    burgerBtn.classList.remove('burger--active');
    document.body.classList.remove('header--menu-open');

    var ease = bezier(cfg.ease[0], cfg.ease[1], cfg.ease[2], cfg.ease[3]);
    var outSign = cfg.side === 'left' ? -1 : 1;

    gsap.defaults({ ease: ease, duration: cfg.duration });

    /* A completed GSAP timeline gets dropped from the ticker, so reusing one
       across open/close silently stops animating. Build a fresh one each
       time and kill the previous so an interrupted transition stays where
       it was rather than snapping. */
    var tl = null;
    function newTimeline() {
      if (tl) tl.kill();
      tl = gsap.timeline();
      return tl;
    }
    var isOpen = false;

    /* --- breakpoint handling -------------------------------------------- */
    function syncBreakpoint() {
      var wide = window.innerWidth >= cfg.desktopMinWidth;
      if (wide && cfg.desktopBurger) html.classList.add('sdl-cm-desktop');
      else html.classList.remove('sdl-cm-desktop');
    }
    function isTakenOver() {
      var wide = window.innerWidth >= cfg.desktopMinWidth;
      return wide ? cfg.desktopBurger : cfg.takeOverMobile;
    }

    /* --- entrance variants ---------------------------------------------- */
    function entranceFrom() {
      switch (cfg.linkEntrance) {
        case 'rise':   return { yPercent: 130 };
        case 'fade':   return { autoAlpha: 0, yPercent: 40 };
        case 'blur':   return { autoAlpha: 0, yPercent: 40, filter: 'blur(12px)' };
        case 'scale':  return { autoAlpha: 0, scale: 0.86, yPercent: 30 };
        default:       return { yPercent: 140, rotate: 10 };
      }
    }
    function entranceTo() {
      switch (cfg.linkEntrance) {
        case 'rise':   return { yPercent: 0 };
        case 'fade':   return { autoAlpha: 1, yPercent: 0 };
        case 'blur':   return { autoAlpha: 1, yPercent: 0, filter: 'blur(0px)' };
        case 'scale':  return { autoAlpha: 1, scale: 1, yPercent: 0 };
        default:       return { yPercent: 0, rotate: 0 };
      }
    }

    /* --- open / close ---------------------------------------------------- */
    function open() {
      if (isOpen) return;
      isOpen = true;
      root.setAttribute('data-nav', 'open');
      html.classList.add('sdl-cm-open');
      if (cfg.lockScroll) html.classList.add('sdl-cm-locked');
      burgerBtn.classList.add('burger--active');
      burgerBtn.setAttribute('aria-expanded', 'true');
      if (scroller) scroller.scrollTop = 0;

      var from = entranceFrom(), to = entranceTo();
      to = merge(to, { stagger: cfg.linkStagger });

      newTimeline()
        .set(root, { display: 'block' })
        .set(panel, { xPercent: 0 }, '<')
        .fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1 }, '<')
        .fromTo(layers,
          { xPercent: 101 * outSign },
          { xPercent: 0, stagger: cfg.curtainStagger, duration: cfg.curtainDuration }, '<')
        .fromTo(links, from, to, '<+=' + cfg.linkDelay);

      if (closeBtn) {
        tl.fromTo(closeBtn,
          { autoAlpha: 0, rotate: -90 },
          { autoAlpha: 1, rotate: 0, duration: cfg.duration * 0.8 }, '<-=0.15');
      }

      if (fades.length) {
        tl.fromTo(fades,
          { autoAlpha: 0, yPercent: 50 },
          { autoAlpha: 1, yPercent: 0, stagger: cfg.fadeStagger }, '<+=0.2');
      }
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      root.setAttribute('data-nav', 'closed');
      html.classList.remove('sdl-cm-open', 'sdl-cm-locked');
      burgerBtn.classList.remove('burger--active');
      burgerBtn.setAttribute('aria-expanded', 'false');
      closeAllFolders(true);

      newTimeline()
        .to(scrim, { autoAlpha: 0 })
        .to(panel, { xPercent: 120 * outSign }, '<')
        .set(root, { display: 'none' })
        .set(panel, { xPercent: 0 });
    }

    function toggle() { isOpen ? close() : open(); }

    /* --- folders --------------------------------------------------------- */
    function closeAllFolders(instant) {
      Array.prototype.forEach.call(root.querySelectorAll('.sdl-cm__item.is-open'), function (li) {
        collapse(li, instant);
      });
    }

    function collapse(li, instant) {
      li.classList.remove('is-open');
      var btn = li.querySelector('.sdl-cm__link--folder');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      var sub = li.querySelector('.sdl-cm__sub');
      if (!sub) return;
      gsap.killTweensOf(sub);
      if (instant) { gsap.set(sub, { height: 0, autoAlpha: 0 }); return; }
      gsap.to(sub, {
        height: 0,
        autoAlpha: 0,
        duration: cfg.submenuDuration * 0.8,
        ease: ease,
        overwrite: true
      });
    }

    function expand(li) {
      li.classList.add('is-open');
      var btn = li.querySelector('.sdl-cm__link--folder');
      if (btn) btn.setAttribute('aria-expanded', 'true');
      var sub = li.querySelector('.sdl-cm__sub');
      if (!sub) return;
      gsap.killTweensOf(sub);
      gsap.to(sub, {
        height: 'auto',
        autoAlpha: 1,
        duration: cfg.submenuDuration,
        ease: ease,
        overwrite: true
      });
      gsap.fromTo(sub.querySelectorAll('.sdl-cm__sub-item'),
        { yPercent: 60, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: cfg.submenuDuration * 0.9,
          ease: ease,
          stagger: cfg.submenuLinkStagger,
          overwrite: true
        });
    }

    Array.prototype.forEach.call(root.querySelectorAll('.sdl-cm__link--folder'), function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var li = btn.closest('.sdl-cm__item');
        if (li.classList.contains('is-open')) { collapse(li); return; }
        if (cfg.submenuAutoClose) closeAllFolders();
        expand(li);
      });
    });

    /* --- wiring ----------------------------------------------------------- */

    /* Capture-phase so Squarespace's own handler never runs. */
    burgerBtn.addEventListener('click', function (e) {
      if (!isTakenOver()) return;      // let Squarespace handle it
      e.preventDefault();
      e.stopImmediatePropagation();
      toggle();
    }, true);

    /* Every [data-cm-close] control shuts the menu — the scrim opts out if
       the site owner wants the panel to stay put on outside clicks. */
    Array.prototype.forEach.call(root.querySelectorAll('[data-cm-close]'), function (n) {
      if (n === scrim && !cfg.closeOnScrim) return;
      n.addEventListener('click', close);
    });

    if (cfg.closeOnEsc) {
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isOpen) close();
      });
    }

    if (cfg.closeOnLinkClick) {
      Array.prototype.forEach.call(root.querySelectorAll('a[href]'), function (a) {
        a.addEventListener('click', function () {
          var href = a.getAttribute('href') || '';
          /* Same-page anchors should close immediately; navigations close too,
             which keeps the state clean if the browser restores the page. */
          if (href.charAt(0) === '#' || !a.hasAttribute('target')) close();
        });
      });
    }

    /* Keep focus inside the panel while open */
    document.addEventListener('keydown', function (e) {
      if (!isOpen || e.key !== 'Tab') return;
      var focusables = root.querySelectorAll('a[href], button:not([disabled])');
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    var rAF;
    window.addEventListener('resize', function () {
      cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(syncBreakpoint);
    });

    /* If the site owner switches into edit mode without a reload, stand down
       completely so Squarespace's own header is editable again. */
    function teardown() {
      if (tl) tl.kill();
      html.classList.remove('sdl-cm-active', 'sdl-cm-desktop', 'sdl-cm-open',
                            'sdl-cm-locked', 'sdl-cm-burger-left',
                            'sdl-cm-burger-right', 'sdl-cm-hide-actions',
                            'sdl-cm-hide-cart');
      burgerBtn.classList.remove('burger--active');
      burgerBtn.removeAttribute('aria-expanded');
      if (root.parentNode) root.parentNode.removeChild(root);
      editorWatch.disconnect();
      window.SDL_CURTAIN_MENU = null;
    }

    var editorWatch = new MutationObserver(function () {
      if (inEditor()) teardown();
    });
    editorWatch.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: false
    });
    editorWatch.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: false
    });

    syncBreakpoint();
    burgerBtn.setAttribute('aria-expanded', 'false');

    /* Public handle for debugging / other plugins */
    window.SDL_CURTAIN_MENU = {
      open: open, close: close, toggle: toggle,
      destroy: teardown, config: cfg, root: root
    };
  }

  function boot() {
    loadGsap(function () {
      try { init(); }
      catch (err) { console.error('[SDL Curtain Menu]', err); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
