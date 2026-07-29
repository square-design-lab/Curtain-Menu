# SDL Curtain Menu v1.0

A GSAP-driven hamburger menu for **Squarespace 7.1** — desktop included. Three
staggered curtains slide in before the panel settles, the links rise into place
with a slight tilt, and folders become slide-down dropdowns instead of
Squarespace's native hover flyouts.

Rebuilt from the mechanics of the Osmo *"Custom Menu with GSAP"* Webflow demo,
then wired to read your existing Squarespace navigation so there is nothing to
maintain twice.

---

## What it does

- **Hamburger on desktop.** Hides the inline nav and reveals Squarespace's own
  burger button above a breakpoint you choose. The burger icon is untouched —
  the plugin toggles the native `burger--active` class, so it animates to an X
  exactly as your theme intends.
- **Staggered curtains.** 1–5 colour layers slide in on their own beats. The
  last one stays behind the menu, so it doubles as the panel background.
- **Slide-down submenus.** Squarespace folders become accordions with a plus,
  chevron, caret or arrow toggle. Optional one-open-at-a-time behaviour.
- **Seven hover treatments** — wipe, roll, per-letter roll, slide, underline,
  fill and outline.
- **Inherits your header.** Font and colour are sampled from the live header by
  default, with a contrast guard so text never lands unreadable on a curtain.
- **Keeps the rest of your header.** Social icons, buttons, cart and account
  stay where they are, and the header button is mirrored into the panel so it
  is still reachable when a full-width panel covers it.
- **Off inside the editor.** Detects the Squarespace editor five ways and tears
  itself down if you switch into edit mode without a reload.

---

## Install

Open [`config-generator.html`](config-generator.html), dial in the look, and
press **Copy code**. Paste the result into
**Settings → Advanced → Code Injection → Footer**.

The generated snippet looks like this:

```html
<!-- SDL Curtain Menu v1.0 — Square Design Lab -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/square-design-lab/Curtain-Menu@v1.0.0/curtainMenu.css">
<script>
  window.SDL_CURTAIN_MENU_CONFIG = {
    "curtains": ["#FF4C24", "#FFFFFF", "#E3E1DE"],
    "hoverEffect": "wipe"
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/square-design-lab/Curtain-Menu@v1.0.0/curtainMenu.js" defer></script>
```

Only the values you changed are emitted — everything else falls back to the
defaults below. GSAP is loaded automatically from a CDN if it isn't already on
the page.

---

## Configuration

### Activation

| Key | Default | Notes |
| --- | --- | --- |
| `enable` | `true` | Master switch. |
| `desktopBurger` | `true` | Hide the inline nav and show the burger on desktop. |
| `desktopMinWidth` | `768` | Width at or above which desktop rules apply. |
| `takeOverMobile` | `true` | Also replace Squarespace's mobile menu. |
| `burgerAlign` | `'default'` | `default` \| `right` \| `left`. |
| `keepHeaderActions` | `true` | Leave social icons / buttons in the header. |
| `keepHeaderCart` | `true` | Leave the cart icon in the header. |
| `navSelector` | `''` | Override which list the menu is built from. |

### Panel & spacing

| Key | Default | Notes |
| --- | --- | --- |
| `side` | `'right'` | `right` \| `left` \| `full`. |
| `width` | `'46vw'` | Any CSS length. |
| `maxWidth` | `720` | px. |
| `radius` | `28` | Corner radius on the panel's inner edge. |
| `padX` / `padTop` / `padBottom` | `'5vw'` / `140` / `48` | Panel padding. |
| `widthMobile` / `padXMobile` / `padTopMobile` | `'100%'` / `'7vw'` / `110` | Below 768px. |
| `itemGap` | `0` | Extra space between top-level rows. |
| `footerGap` | `40` | Space above the footer block. |

### Curtains

| Key | Default | Notes |
| --- | --- | --- |
| `curtains` | `['#FF4C24','#FFFFFF','#E3E1DE']` | Last entry is the panel background. |
| `scrimColor` | `'#131313'` | Backdrop tint over the page. |
| `scrimOpacity` | `0.4` | |

### Motion

| Key | Default | Notes |
| --- | --- | --- |
| `duration` | `0.7` | Base tween duration. |
| `ease` | `[0.65,0.01,0.05,0.99]` | Cubic-bezier control points. |
| `curtainStagger` / `curtainDuration` | `0.12` / `0.575` | |
| `linkStagger` / `linkDelay` | `0.05` / `0.35` | |
| `linkEntrance` | `'riseRotate'` | `riseRotate` \| `rise` \| `fade` \| `blur` \| `scale`. |
| `fadeStagger` | `0.04` | Footer items. |

### Typography

| Key | Default | Notes |
| --- | --- | --- |
| `fontSource` | `'headerNav'` | `headerNav` \| `siteHeading` \| `custom`. |
| `fontFamily` | `'auto'` | `'auto'` samples `fontSource`. |
| `align` | `'left'` | `left` \| `center` \| `right`. |
| `fontSize` / `fontSizeMobile` | `64` / `34` | px. |
| `fontWeight` | `700` | |
| `letterSpacing` | `-0.02` | em. |
| `lineHeight` | `1.02` | |
| `textTransform` | `'uppercase'` | |
| `textColor` | `'auto'` | `'auto'` samples the header nav colour. |
| `linkPaddingY` | `10` | px. |

### Hover

| Key | Default | Notes |
| --- | --- | --- |
| `hoverEffect` | `'wipe'` | `wipe` \| `rollup` \| `charRoll` \| `slide` \| `underline` \| `fill` \| `outline` \| `none`. |
| `hoverTextColor` | `'#FFFFFF'` | |
| `hoverBgColor` | `'#131313'` | |

### Numbers, submenus, close button, footer

| Key | Default | Notes |
| --- | --- | --- |
| `showNumbers` | `true` | |
| `numberColor` / `numberFormat` / `numberPosition` | `'#FF4C24'` / `'pad'` / `'after'` | `pad` → `01`. |
| `submenuEnabled` | `true` | Off → folders render as flat links. |
| `submenuIcon` | `'plus'` | `plus` \| `chevron` \| `caret` \| `arrow`. |
| `submenuIconPosition` | `'inline'` | `inline` \| `edge`. |
| `submenuFontSize` / `submenuColor` / `submenuIndent` | `20` / `'auto'` / `24` | |
| `submenuDuration` / `submenuLinkStagger` | `0.5` / `0.035` | |
| `submenuAutoClose` | `true` | One folder open at a time. |
| `closeButton` | `true` | In-panel close control. |
| `closeStyle` / `closeLabel` / `closeSize` / `closeColor` | `'text'` / `'Close'` / `26` / `''` | |
| `showSocials` | `true` | Mirror the site's social icons. |
| `showHeaderButton` | `true` | Mirror the header CTA. |
| `footerText` | `''` | |
| `footerLinks` | `[]` | `[{ label, url }]`. |

### Behaviour

| Key | Default |
| --- | --- |
| `closeOnEsc` | `true` |
| `closeOnLinkClick` | `true` |
| `closeOnScrim` | `true` |
| `lockScroll` | `true` |

---

## Notes

**Why a close button inside the panel.** Squarespace's `#header` creates its own
stacking context, so the native burger cannot be reliably raised above a
full-screen overlay. The panel therefore carries its own close control. Escape
and a backdrop click work too.

**Curtains do not scroll.** The panel holds the curtains; a separate inner layer
scrolls. A long menu scrolls without the curtains sliding away with it.

**GSAP owns opacity.** Elements the timeline animates deliberately carry no CSS
`opacity` transition — two engines animating one property produces visible jank.

**Reduced motion.** `prefers-reduced-motion: reduce` collapses the CSS
transitions.

**Public API.** `window.SDL_CURTAIN_MENU` exposes `open()`, `close()`,
`toggle()`, `destroy()`, `config` and `root`.

---

## Files

| File | Purpose |
| --- | --- |
| `curtainMenu.js` | Engine — reads the nav, builds the overlay, runs the timeline. |
| `curtainMenu.css` | Styles, header take-over, hover effects. |
| `config-generator.html` | Visual configurator with a live preview of the real plugin. |

Built by [Square Design Lab](https://squaredesignlab.com).
