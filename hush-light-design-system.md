---
name: Infrastructure Light
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1b1b1b'
  on-surface-variant: '#4c4546'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e1dfdf'
  on-secondary-container: '#626262'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1b'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e4e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '450'
    lineHeight: '1.6'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.05em
spacing:
  unit: 4px
  gutter: 24px
  margin: 32px
  container-max: 1280px
---

## Brand & Style

This design system communicates reliability, transparency, and technical rigor through a "Serious Infrastructure" aesthetic. It moves away from the visual noise of modern consumer software, favoring a brutalist-informed minimalism that treats the UI as a professional instrument rather than an interface.

The tone is sober and utilitarian. It is designed for high-stakes environments—cloud orchestration, security monitoring, and financial systems—where clarity is the highest priority. The aesthetic relies on strict alignment, high-contrast monochrome values, and the removal of all decorative elements that do not serve a functional or structural purpose.

## Colors

The palette is strictly monochrome, utilizing a pure white (#FFFFFF) foundation to maximize contrast and perceived "cleanliness" of the technical environment. 

- **Primary:** Black (#000000) is used for all primary text, icons, and structural borders to ensure maximum legibility.
- **Secondary:** Mid-grey (#666666) is reserved for secondary metadata, disabled states, and non-essential technical labels.
- **Surface:** A very light grey (#F9F9F9) is used for code blocks and data tables to distinguish them from the primary page surface.
- **Border:** Dividers and box outlines use a crisp light grey (#E5E5E5). In interactive states, borders switch to Black (#000000).

## Typography

Typography is used as a structural tool. **Inter** provides high legibility for UI controls and long-form technical documentation. **JetBrains Mono** is utilized for all "active" data, system outputs, timestamps, and technical identifiers, signaling to the user that the information is machine-generated or part of the infrastructure layer.

Headlines should be set with tight tracking and high weight to anchor the page. Data labels are set in uppercase monospaced type to create a distinct visual rhythm in dense information environments.

## Layout & Spacing

The layout follows a strict 8px/4px grid system. A 12-column fluid grid is used for general UI, but technical dashboards may switch to a "Modular Box" layout where content is partitioned by 1px borders rather than negative space.

- **Desktop:** 12 columns, 24px gutters, 32px margins.
- **Mobile:** 4 columns, 16px gutters, 16px margins.
- **Alignment:** All elements must align to the baseline grid. Boxes and containers should use 0px margin between adjacent borders to create "connected" table-like structures.

## Elevation & Depth

This design system eschews shadows and blurs. Depth is conveyed exclusively through **border weight** and **tonal layering**.

1.  **Level 0 (Base):** Pure white (#FFFFFF).
2.  **Level 1 (Inset/Grouping):** Off-white (#F9F9F9) with a 1px border.
3.  **Level 2 (Active/Floating):** White background with a 2px black border (used for modals or active dropdowns).

Diagrams and technical schematics should use 1px black lines with no fills, except for "active" nodes which may use a solid black fill with white text.

## Shapes

The shape language is strictly orthogonal. All buttons, inputs, cards, and containers feature 0px border radius (Sharp). This reinforces the "infrastructure" feel, suggesting a system that is rigid, precise, and uncompromising.

Circles are permitted only for status indicators (e.g., system up/down lights) or user avatars, where they provide a necessary visual break from the grid.

## Components

- **Buttons:** Rectangular with 1px black borders. Primary buttons use a solid black fill with white text. Secondary buttons use a white fill with black text. On hover, buttons should invert their color scheme or increase border weight.
- **Inputs:** Simple 1px borders (#E5E5E5) that turn black on focus. Use JetBrains Mono for the input text to emphasize the technical nature of data entry.
- **Status Chips:** Small, rectangular boxes with monospaced text. Use a 1px border. No background fill unless indicating a critical error (Solid Black).
- **Data Tables:** Use 1px horizontal and vertical dividers. Header cells should have a light grey background (#F9F9F9) and use uppercase monospaced labels.
- **Technical Diagrams:** Use "Connector Lines" that are strictly 90-degree angles. Use 1px black strokes. Arrows should be simple open heads (e.g., `->`).
- **Lists:** Use monospaced indices (01, 02, 03) for ordered lists. Use a simple horizontal line divider between all list items.