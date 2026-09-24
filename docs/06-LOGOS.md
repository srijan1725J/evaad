# evaad Logo Specifications

## Primary Mark (v5c)

The mark is a half-arc forming the upper eyelid of an open eye, with
two arrowheads at the ends of the arc pointing OUTWARD (one left, one
right). Inside the arc sits a stylized human eye (almond shape with
iris, pupil, and small white glint).

The two outward-pointing arrowheads symbolize "looking both ways" /
"see both sides". The arc is the eyelid opening.

### Enhanced v0.5 SVG

```svg
Arc:      M 8 28 Q 32 12 56 28
          stroke: #ff8a3d -> #e8458a -> #ff6b6b gradient
          stroke-width: 5, round caps
          filter: glow effect

Left arrowhead:  polygon at 2,30 14,24 14,34
Right arrowhead: polygon at 62,30 50,24 50,34

Eye almond: M 19 38 Q 32 30 45 38 Q 32 46 19 38 Z
            filled gradient

Iris/pupil: ellipse cx 32 cy 38 rx 6 ry 4.2
            fill #07080c

Glint:      circle cx 33.4 cy 36.6 r 1.4
            fill white opacity 0.95
```

## Wordmark

The wordmark combines the mark with the text "evaad" in a bold,
lowercase, modern sans-serif. The "e" is slanted forward ~10 degrees
with a horizontal cut through the middle bar (gaming/esports e style),
not a rounded curve.

## Files

- `assets/logo-v5c-full.svg` — Primary mark only (64x64)
- `assets/logo-v5-wordmark.svg` — Mark + wordmark lockup (220x48)
- `web-preview/favicon.svg` — Favicon version (64x64 with rounded bg)
