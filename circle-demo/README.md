# Circle Demo — Gem Stone UI

An interactive gem stone component built with pure HTML/CSS/JS. No libraries.

---

## Core Learnings

### 1. Image border

The border ring is a separate element positioned `absolute` behind the stone, sized slightly larger than the inner gem. Both share the same shape, so the visible gap between them becomes the border.

The key is layering: the ring element holds the gold texture image, the gem element sits centered on top with `z-index: 1`. The metal texture fills the exposed ring area naturally.

To tint the border texture without affecting the gem image, use two `background-image` layers on the ring element — a `linear-gradient` tint on top of the texture — and connect them with `background-blend-mode: color`. This keeps the blend fully self-contained inside the ring element.

---

### 2. Filters on the border

`filter` applies to the entire rendered output of an element, including any gradient layers painted on it. This is the critical gotcha: if you use `filter: grayscale(1)` to desaturate the texture and then apply a colored tint via `background-blend-mode`, the filter will also desaturate the tint — leaving everything gray.

The rule: only use `grayscale` when the tint color is already achromatic (silver). For colored metals like copper or rose gold, skip grayscale and let `background-blend-mode: color` do the full hue shift on its own.

---

### 3. Organic stone shapes

`clip-path: polygon()` defined in percentage units is the foundation. Applying the same percentage polygon to both the outer ring wrapper and the inner gem element creates the organic border automatically — the same shape at two different sizes, centered, produces a natural gap around the edge.

The border thickness emerges from the size difference between the two elements, not from any border property. Switching shapes is just swapping the `clip-path` string on both elements at once.

Adding `transition: clip-path 0.4s ease` to both elements gives free morph animation between shapes.

---

### 4. Scaling while keeping the image smooth

`background-size: cover` ensures the image always fills the element regardless of its dimensions — no stretching, no gaps. As the element grows or shrinks, the image re-crops from center.

To keep the scaling visually smooth, drive all size changes through CSS transitions (`transition: width 0.15s, height 0.15s`) and update sizes via `element.style.width/height` in JS. The browser interpolates between sizes, and `cover` resamples continuously during the transition.

Using discrete checkpoints (0.2 → 0.4 → 0.6 → 0.8 → 1.0) mapped to explicit pixel values in JS keeps the sizing predictable and avoids subpixel blur at intermediate steps.
