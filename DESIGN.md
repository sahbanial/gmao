---
name: Industrial Precision
source: stitch
stitchProjectId: projects/13537135584261273264
stitchProjectTitle: GMAO Inserter Performance Tracker
colorMode: LIGHT
roundness: ROUND_FOUR
customColor: '#1e3a8a'
colorVariant: FIDELITY
syncedAt: 2026-08-14
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444651'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#00311f'
  on-tertiary: '#ffffff'
  tertiary-container: '#004a31'
  on-tertiary-container: '#27c38a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-kpi:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  tabular-nums:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

This design system is engineered for the rigors of maintenance management and industrial operations. It prioritizes utility, rapid data ingestion, and reliability over aesthetic flourish. The style is **Corporate Modern with a Functional Industrial edge**, characterized by structured layouts, high-contrast states, and a utilitarian approach to whitespace.

The target audience consists of maintenance managers, field technicians, and plant directors who require immediate clarity on equipment health and task status. The UI must evoke a sense of **authority and stability**, ensuring that critical failures (downtime) are visually prioritized against routine maintenance tasks.

## Colors

The color palette is strictly functional, adhering to industrial safety standards and high-legibility requirements.

- **Primary (Industry Blue):** Used for navigation, primary actions, and branding. It provides a stable, professional foundation.
- **Secondary (Safety Orange):** Reserved for alerts, critical task indicators, and elements requiring immediate user attention.
- **Tertiary (Success Green):** Indicates healthy equipment, uptime, and completed maintenance targets.
- **Functional Grays:** A neutral range optimized for background layering and data-heavy tables to reduce eye strain during long shifts.
- **Status Tokens:**
  - **Success:** Uptime, TRS targets met.
  - **Warning:** Approaching maintenance, borderline performance.
  - **Danger:** Critical failure, unplanned downtime, safety hazards.
  - **Info:** Technical documentation, manuals, and general telemetry data.

## Typography

The typography system uses **Inter** for its exceptional legibility at small sizes and high-density environments.

- **Data Density:** Use `body-sm` for secondary metadata in tables and lists.
- **Numerical Hierarchy:** KPIs and machine metrics should use `display-kpi` or `tabular-nums`. Always enable tabular lining for numbers in data grids to ensure vertical alignment.
- **Scanning:** Headlines are bold and compact to allow for more content per screen. `label-caps` is used for category headers and status indicators to differentiate them from interactive text.

## Layout & Spacing

The system employs a **Fluid-Responsive Grid** optimized for high-density information.

- **Grid Model:** 12-column grid for desktop, 8-column for tablet, and 4-column for mobile.
- **Spacing Rhythm:** Based on a 4px baseline. Use 16px (md) for standard component spacing and 8px (sm) for internal element grouping within cards or list items.
- **High-Density Mode:** For tablet and desktop, reduce vertical padding to `sm` (8px) in data tables to maximize the number of visible rows.
- **Touch Targets:** Despite the high density, all interactive elements (buttons, inputs) must maintain a minimum height of 44px on mobile and tablet to accommodate gloved interaction.

## Elevation & Depth

To maintain an "Industrial Precision" aesthetic, depth is conveyed through **Tonal Layers** and **Rigid Outlines** rather than soft shadows.

- **Surface Levels:**
  - **Background:** Light gray (#F9FAFB) for the main canvas.
  - **Surface:** White (#FFFFFF) for primary content cards and containers.
  - **Overlay:** Subtle inner shadows or 1px borders (#E2E8F0) to define nested elements.
- **Interaction Depth:** Active states for buttons and cards should use a slight inset shadow or a higher contrast border (2px) to provide tactile feedback without relying on complex blurs.
- **Borders:** Use clear, defined borders for all interactive inputs to ensure visibility in high-glare environments.

## Shapes

The shape language is **Soft (0.25rem)**, leaning towards architectural rigidity. This balance provides a professional look that feels modern but avoids the "playfulness" of highly rounded corners.

- **Standard Elements:** Buttons, inputs, and small cards use the base `rounded` (4px) setting.
- **Large Containers:** Dashboard widgets or modal containers can use `rounded-lg` (8px) to soften the hierarchy.
- **Status Badges:** Use the base `rounded` (4px) corner to maintain the industrial block look, avoiding pill shapes unless specifically used for toggle switches.

## Components

### Buttons

- **Primary:** Solid `Industry Blue` with white text. High contrast, minimum 48px height for field use.
- **Urgent/Stop:** Solid `Danger Red`. Used for "Stop Machine" or "Emergency Work Order."
- **Outline:** 2px border for secondary actions like "Add Note" or "Print Label."

### Status Badges

- High-contrast background with bold uppercase text.
- **Downtime:** `Danger Red` background, white text.
- **Uptime:** `Success Green` background, white text.
- **In Progress:** `Info Blue` background, white text.

### Data Cards

- Use white backgrounds with 1px `neutral-200` borders.
- Headers should have a light gray background (#F3F4F6) to separate metadata from body content.
- Include a 4px "accent bar" on the left side of the card to indicate machine status (Green/Yellow/Red).

### Input Fields

- Heavy 2px borders in the resting state to ensure visibility.
- Focus state uses `Industry Blue` border with a subtle 2px glow.
- Labels are always persistent (not floating) to ensure field context is never lost.

### Lists & Tables

- Zebra-striping for rows to improve scanability of long equipment lists.
- Vertical dividers are avoided; horizontal dividers use `neutral-100`.
- Priority icons (High/Medium/Low) should be visually distinct using both color and shape (e.g., Triangle for Danger, Circle for Info).
