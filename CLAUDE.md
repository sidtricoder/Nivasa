# Nivasa Design Standards (CLAUDE.md)

## 🎨 Quiet Luxury Design System

This document defines the persistent design standards for the Nivasa real estate platform. All UI components must follow these guidelines.

---

## Color Palette

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Cloud Dancer | `#F0EEE9` | Page backgrounds |
| Pure White | `#FFFFFF` | Card backgrounds |
| Deep Charcoal | `#2B2F36` | Primary text |
| Signal Blue | `#3B7BFF` | Buttons, links, accents |

### Secondary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Muted Gray | `#6B7280` | Secondary text |
| Light Gray | `#E5E7EB` | Borders, dividers |
| Success Green | `#10B981` | Positive indicators |
| Warning Amber | `#F59E0B` | Caution indicators |

### Forbidden Colors
- ❌ Purple-to-blue gradients (clichéd)
- ❌ Bright/saturated colors
- ❌ Black shadows (use ambient glows instead)

---

## Typography

### Font Family
**Primary:** Plus Jakarta Sans (fallback: Geist, system-ui)

```css
font-family: 'Plus Jakarta Sans', 'Geist', system-ui, sans-serif;
```

### Letter Spacing
| Element | Spacing |
|---------|---------|
| Headings (h1-h3) | `-0.02em` |
| Hero numbers | `-0.04em` |
| Body text | `normal` |

### Forbidden Fonts
- ❌ Inter
- ❌ Roboto
- ❌ Arial/Helvetica

---

## Card Styling

### Base Card
```css
background: rgba(255, 255, 255, 0.95);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.2);
border-radius: 24px;
```

### Ambient Glow Shadow
```css
/* Signal Blue ambient glow */
box-shadow: 0 20px 40px -15px rgba(59, 123, 255, 0.15);
```

---

## Micro-Interactions

### Spring Physics Constants
All hover and transition animations must use:
```javascript
{
  stiffness: 300,
  damping: 30
}
```

### Required Animations
1. **Rolling Numbers** - Financial values animate like a slot machine
2. **Hover Parallax** - Icons move faster than their parent cards
3. **Hover Lift** - Cards lift 4px with shadow expansion on hover

---

## Component Standards

### Buttons
```css
/* Primary Button */
background: #3B7BFF;
color: white;
border-radius: 12px;
font-weight: 600;
box-shadow: 0 4px 14px rgba(59, 123, 255, 0.3);
```

### Input Fields
```css
background: rgba(255, 255, 255, 0.8);
border: 1px solid rgba(0, 0, 0, 0.08);
border-radius: 12px;
```

### Sliders
- Track: Light gray (#E5E7EB)
- Thumb: Signal Blue (#3B7BFF)
- Active: Signal Blue with glow

---

## Layout Grid

### Bento Grid Proportions
- Hero card: 2/3 of total width
- Sidebar widgets: 1/3 of total width
- Gap: 24px (desktop), 16px (mobile)

---

## Dark Mode Overrides

When `dark` class is present:
- Background: `#0F172A` (Slate 900)
- Cards: `rgba(30, 41, 59, 0.9)` (Slate 800)
- Text: `#F8FAFC` (Slate 50)
- Signal Blue remains: `#3B7BFF`

---

## Implementation Notes

1. Import Plus Jakarta Sans via Google Fonts in `index.html`
2. Use Framer Motion for all animations
3. Never use `transition` CSS - always spring animations
4. All financial numbers use `tabular-nums` font-feature
