---
name: hush
colors:
  surface: '#141313'
  surface-dim: '#141313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353434'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c6c6cf'
  on-secondary: '#2f3037'
  secondary-container: '#45464e'
  on-secondary-container: '#b4b4bd'
  tertiary: '#ffffff'
  on-tertiary: '#2f3131'
  tertiary-container: '#e2e2e2'
  on-tertiary-container: '#636565'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e2e1eb'
  secondary-fixed-dim: '#c6c6cf'
  on-secondary-fixed: '#1a1b22'
  on-secondary-fixed-variant: '#45464e'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#141313'
  on-background: '#e5e2e1'
  surface-variant: '#353434'
typography:
  display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  mono-label:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  mono-code:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.6'
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin: 24px
  max-width: 1200px
---

## Brand & Style

This design system embodies the concept of "silent security." It is built for a zero-trust cryptographic ecosystem where the UI acts as a transparent, high-precision instrument rather than a decorative layer. The brand personality is rooted in serious infrastructure and quiet confidence—it does not seek attention, but earns trust through technical rigor and extreme legibility.

The aesthetic follows a **Technical Minimalism** approach, blending the brutalist clarity of developer tools with the refined execution of modern productivity software. It avoids all forms of visual "noise"—no gradients, no shadows, and no decorative animations. The emotional response should be one of absolute control and stability.

## Colors

The palette is strictly monochromatic to emphasize content and cryptographic status over decoration. 

- **Base:** Pure black (`#000000`) is the foundation for all backgrounds to maximize contrast and reduce visual fatigue.
- **Surfaces:** Deep grays (`#111111`, `#1A1A1A`) are used to define containers and functional zones without relying on elevation or shadows.
- **Accents:** Stark white (`#FFFFFF`) is reserved for primary actions and headings. Subtle silver/zinc (`#A1A1AA`) is used for secondary text and non-critical UI elements.
- **Functional:** Success, warning, or error states should be handled via iconography or high-contrast white-on-black reversals rather than vibrant colors, though a desaturated red/green may be used sparingly for critical security alerts.

## Typography

Typography is the primary driver of the hierarchy. We use **Geist** for its clinical, Swiss-inspired precision in all interface elements and prose. **JetBrains Mono** is utilized for any data that is "computed" or "technical"—keys, hashes, file paths, and terminal outputs.

- **Headings:** Should be set with tight letter spacing and substantial leading.
- **Technical Details:** Always use the monospace family for any value that requires character-level inspection (e.g., hash prefixes).
- **Labels:** Small caps or slightly tracked-out monospace text should be used for metadata headers to distinguish them from user content.

## Layout & Spacing

The layout is governed by a **high-precision fixed grid** on desktop and a fluid system on mobile. 

- **Grid:** A 12-column grid with 16px gutters. Elements should align strictly to the 4px baseline grid.
- **Rhythm:** Use generous whitespace to isolate cryptographic functions. A "less is more" approach ensures that critical security information is never crowded.
- **Borders:** Use 1px solid borders (`#1A1A1A`) to define sections. Layout divisions are created by these lines rather than background color changes.
- **Responsiveness:** On mobile, margins reduce to 16px and the 12-column grid collapses to a single column. Large display type scales down to `headline-lg` metrics for readability.

## Elevation & Depth

This design system rejects the concept of Z-axis "floating." There are no shadows. Depth is communicated through **Tonal Layering** and **Line Work**:

1.  **Level 0 (Base):** Pure Black (`#000000`).
2.  **Level 1 (Surfaces):** Dark Gray (`#111111`) with a 1px border.
3.  **Level 2 (Modals/Overlays):** Dark Gray (`#1A1A1A`) with a high-contrast white border.

To indicate focus or active states, use a stark white 1px outline or a solid white background with black text. Avoid backdrop blurs unless necessary for readability over complex technical logs.

## Shapes

The shape language is **Sharp**. 0px border radius is used for all primary containers, buttons, and input fields. This reinforces the "infrastructure" feel and ensures pixel-perfect alignment with the grid.

In rare cases where internal components need to be distinguished (like small tags or status pips), a "Soft" (4px) radius may be used, but the default remains 90-degree corners to maintain a rigid, architectural structure.

## Components

### Buttons
- **Primary:** Solid White background, Black text. No border. Sharp corners.
- **Secondary:** Transparent background, 1px White border. White text.
- **Ghost:** Transparent background, no border. Zinc (`#A1A1AA`) text, turns White on hover.

### Inputs
- **Text Fields:** 1px border (`#1A1A1A`). Background is transparent or `#111111`. Monospaced text for sensitive inputs (keys).
- **Focus State:** 1px Solid White border. No glow or outer shadow.

### Status Indicators
- **Encrypted/Secure:** A simple white dot or a padlock icon (hollow).
- **Activity:** Thin, 1px horizontal bars (resembling a network pulse).

### Specialized Components
- **Key-Value Lists:** Used for metadata. Label in Zinc Monospace (left), Value in White Sans-serif (right).
- **The "Console" View:** A dedicated section for cryptographic logs using `mono-code` and a slightly darker background (`#080808`) to differentiate it from the primary UI.
- **Borders:** Use vertical and horizontal lines to create a "blueprint" feel between navigation and content areas.