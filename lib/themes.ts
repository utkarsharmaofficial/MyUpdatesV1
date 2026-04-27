export interface ThemeDefinition {
  id: string
  name: string
  c1: string          // brand-light
  c2: string          // brand-mid
  c3: string          // brand-strong
  surface: string
  empty: string
  border: string
  borderStrong: string
}

export const THEME_DEFINITIONS: Record<string, ThemeDefinition> = {
  orange: {
    id: 'orange',
    name: 'Orange',
    c1: '#FBA98E',
    c2: '#F86A3A',
    c3: '#F64409',
    surface: '#FFF8F6',
    empty: '#F5EDE9',
    border: '#F0E8E5',
    borderStrong: '#E8D5CF',
  },
  red: {
    id: 'red',
    name: 'Red',
    c1: '#FFB3AD',   // light rosy-salmon — clearly distinct
    c2: '#FF6259',   // medium coral-red — clearly distinct
    c3: '#FF0000',   // vivid red
    surface: '#FFF6F6',
    empty: '#F5E5E5',
    border: '#EFE0E0',
    borderStrong: '#E5D0D0',
  },
  blue: {
    id: 'blue',
    name: 'Blue',
    c1: '#A0C4FF',   // light powder blue — clearly distinct
    c2: '#4488FF',   // medium royal blue — clearly distinct
    c3: '#0000FF',   // vivid blue
    surface: '#F5F8FF',
    empty: '#E8EEF9',
    border: '#DDE5F2',
    borderStrong: '#CDDAEE',
  },
}

export const THEME_ORDER = ['orange', 'red', 'blue', 'custom']

// ── Custom theme derivation ───────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6
    else if (max === g) h = (b - r) / delta + 2
    else h = (r - g) / delta + 4
    h = Math.round(h * 60)
    if (h < 0) h += 360
  }

  const l = (max + min) / 2
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

  return [h, Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/** Given a base (strong) hex color, derive 3 theme shades.
 *  c1 is the lightest/most pastel, c3 is the provided base. */
export function deriveCustomTheme(
  baseHex: string,
  existingC1?: string | null,
  existingC2?: string | null,
): ThemeDefinition {
  const [h, s, l] = hexToHsl(baseHex)

  const c2 = existingC2 ?? hslToHex(h, s, Math.min(l + 18, 93))
  const c1 = existingC1 ?? hslToHex(h, Math.max(s - 10, 0), Math.min(l + 33, 93))

  // Derive surface/empty/border as very light tints in the same hue
  const surface     = hslToHex(h, Math.max(s - 20, 0), 98)
  const empty       = hslToHex(h, Math.max(s - 15, 0), 95)
  const border      = hslToHex(h, Math.max(s - 25, 0), 93)
  const borderStrong = hslToHex(h, Math.max(s - 20, 0), 89)

  return {
    id: 'custom',
    name: 'Custom',
    c1,
    c2,
    c3: baseHex,
    surface,
    empty,
    border,
    borderStrong,
  }
}
