import type { ThemeDefinition } from 'vuetify'
import { Icon } from '@iconify/vue'
import { createVuetify } from 'vuetify'
import { VCalendar } from 'vuetify/labs/VCalendar'

// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

/**
 * Util simples de lighten/darken (0–1)
 * @param hex - Cor hexadecimal (#RRGGBB)
 * @param whiteOrBlack - '#ffffff' para lighten, '#000000' para darken
 * @param amount - Intensidade (0-1)
 */
function mix(hex: string, whiteOrBlack: '#ffffff' | '#000000', amount: number): string {
  const n = (h: string) => Number.parseInt(h, 16)
  const [r, g, b] = [n(hex.slice(1, 3)), n(hex.slice(3, 5)), n(hex.slice(5, 7))]
  const [wr, wg, wb] = whiteOrBlack === '#ffffff' ? [255, 255, 255] : [0, 0, 0]
  const m = (c: number, wc: number) => Math.round(c + (wc - c) * amount)
  const toHex = (v: number) => v.toString(16).padStart(2, '0')
  return `#${toHex(m(r, wr))}${toHex(m(g, wg))}${toHex(m(b, wb))}`
}

function lighten(hex: string, a = 0.25) {
  return mix(hex, '#ffffff', a)
}

function darken(hex: string, a = 0.20) {
  return mix(hex, '#000000', a)
}

function createCidadeTema(): ThemeDefinition {
  const cfg = useRuntimeConfig().public as any

  const light = {
    primary: cfg.theme?.primary || '#1E3A8A',
    secondary: cfg.theme?.secondary || '#2563EB',
    accent: cfg.theme?.accent || '#FBBF24',
    background: cfg.theme?.background || '#FFFFFF',
    surface: cfg.theme?.surface || '#FAFAFA',
    surfaceVariant: cfg.theme?.surfaceVariant || '#F5F5F5',
    outline: cfg.theme?.outline || '#64748B',
    text: cfg.theme?.text || '#212121',
    muted: cfg.theme?.muted || '#424242',
  }

  return {
    dark: false,
    colors: {
      // Cores primárias com variações derivadas
      'primary': light.primary,
      'primary-darken-1': darken(light.primary, 0.18),
      'primary-darken-2': darken(light.primary, 0.30),
      'primary-lighten-1': lighten(light.primary, 0.22),
      'primary-lighten-2': lighten(light.primary, 0.40),

      // Cores secundárias com variações derivadas
      'secondary': light.secondary,
      'secondary-darken-1': darken(light.secondary, 0.18),
      'secondary-darken-2': darken(light.secondary, 0.30),
      'secondary-lighten-1': lighten(light.secondary, 0.22),
      'secondary-lighten-2': lighten(light.secondary, 0.40),

      // Accent e warning baseados no accent
      'accent': light.accent,
      'accent-darken-1': darken(light.accent, 0.18),
      'accent-darken-2': darken(light.accent, 0.30),
      'accent-lighten-1': lighten(light.accent, 0.22),
      'accent-lighten-2': lighten(light.accent, 0.40),
      'warning': light.accent,
      'warning-darken-1': darken(light.accent, 0.18),
      'warning-darken-2': darken(light.accent, 0.30),
      'warning-lighten-1': lighten(light.accent, 0.22),
      'warning-lighten-2': lighten(light.accent, 0.40),

      // Cores neutras derivadas do outline
      'neutral': light.outline,
      'neutral-darken-1': darken(light.outline, 0.15),
      'neutral-darken-2': darken(light.outline, 0.25),
      'neutral-darken-3': darken(light.outline, 0.35),
      'neutral-darken-4': darken(light.outline, 0.45),
      'neutral-lighten-1': lighten(light.outline, 0.15),
      'neutral-lighten-2': lighten(light.outline, 0.25),
      'neutral-lighten-3': lighten(light.outline, 0.35),
      'neutral-lighten-4': lighten(light.outline, 0.45),
      'neutral-lighten-5': lighten(light.outline, 0.55),

      // Tons de gris baseados no outline
      'grey': light.outline,
      'grey-darken-1': darken(light.outline, 0.15),
      'grey-darken-2': darken(light.outline, 0.25),
      'grey-darken-3': darken(light.outline, 0.35),
      'grey-darken-4': darken(light.outline, 0.45),
      'grey-lighten-1': lighten(light.outline, 0.15),
      'grey-lighten-2': lighten(light.outline, 0.25),
      'grey-lighten-3': lighten(light.outline, 0.35),
      'grey-lighten-4': lighten(light.outline, 0.45),
      'grey-lighten-5': lighten(light.outline, 0.55),

      // Fundos e superfícies
      'background': light.background,
      'surface': light.surface,
      'surface-variant': light.surfaceVariant,
      'surface-bright': lighten(light.surface, 0.10),
      'surface-dim': darken(light.surface, 0.05),
      'surface-container': mix(light.surface, light.background, 0.5),
      'surface-container-high': darken(light.surface, 0.02),
      'surface-container-highest': darken(light.surface, 0.04),
      'surface-container-low': lighten(light.surface, 0.02),
      'surface-container-lowest': light.background,

      // Cores funcionais
      'error': '#F44336',
      'error-darken-1': '#D32F2F',
      'error-lighten-1': '#EF5350',
      'info': light.secondary,
      'info-darken-1': darken(light.secondary, 0.18),
      'info-lighten-1': lighten(light.secondary, 0.22),
      'success': '#4CAF50',
      'success-darken-1': '#388E3C',
      'success-lighten-1': '#66BB6A',

      // Textos baseados nas cores configuradas
      'on-primary': '#FFFFFF',
      'on-secondary': '#FFFFFF',
      'on-accent': '#FFFFFF',
      'on-background': light.text,
      'on-surface': light.muted,
      'on-surface-variant': light.muted,
      'on-neutral': '#FFFFFF',
      'on-neutral-lighten-3': light.text,
      'outline': light.outline,
      'outline-variant': lighten(light.outline, 0.25),
      'inverse-on-surface': lighten(light.surface, 0.55),
      'inverse-surface': darken(light.outline, 0.35),
      'inverse-primary': lighten(light.primary, 0.40),
      'shadow': '#000000',
      'scrim': '#000000',
    },
    variables: {
      'font-family': '\'Gotham Medium\', \'Poppins\', \'Roboto\', \'Helvetica\', \'Arial\', sans-serif',
      'border-color': light.outline,
      'border-opacity': 0.12,
      'high-emphasis-opacity': 0.87,
      'medium-emphasis-opacity': 0.60,
      'disabled-opacity': 0.38,
      'idle-opacity': 0.04,
      'hover-opacity': 0.08,
      'focus-opacity': 0.12,
      'selected-opacity': 0.12,
      'activated-opacity': 0.16,
      'pressed-opacity': 0.16,
      'dragged-opacity': 0.08,
      'theme-kbd': darken(light.outline, 0.35),
      'theme-on-kbd': '#FFFFFF',
      'theme-code': lighten(light.surface, 0.55),
      'theme-on-code': darken(light.outline, 0.35),
      'shadow-key-umbra-opacity': 0.2,
      'shadow-key-penumbra-opacity': 0.14,
      'shadow-key-ambient-opacity': 0.12,
    },
  }
}

function createCidadeTemaEscuro(): ThemeDefinition {
  const cfg = useRuntimeConfig().public as any

  const dark = {
    primary: lighten(cfg.theme?.primary || '#1E3A8A', 0.40),
    secondary: lighten(cfg.theme?.secondary || '#2563EB', 0.30),
    accent: lighten(cfg.theme?.accent || '#FBBF24', 0.15),
    background: '#0F1419',
    surface: '#1A1F25',
    surfaceVariant: '#2A2F35',
    outline: '#918F99',
    text: '#E4E1E6',
    muted: '#C7C5D0',
  }

  return {
    dark: true,
    colors: {
      // Cores primárias adaptadas para tema escuro
      'primary': dark.primary,
      'primary-darken-1': darken(dark.primary, 0.15),
      'primary-darken-2': darken(dark.primary, 0.25),
      'primary-lighten-1': lighten(dark.primary, 0.15),
      'primary-lighten-2': lighten(dark.primary, 0.25),

      // Cores secundárias adaptadas para tema escuro
      'secondary': dark.secondary,
      'secondary-darken-1': darken(dark.secondary, 0.15),
      'secondary-darken-2': darken(dark.secondary, 0.25),
      'secondary-lighten-1': lighten(dark.secondary, 0.15),
      'secondary-lighten-2': lighten(dark.secondary, 0.25),

      // Accent e warning adaptados
      'accent': dark.accent,
      'accent-darken-1': darken(dark.accent, 0.15),
      'accent-darken-2': darken(dark.accent, 0.25),
      'accent-lighten-1': lighten(dark.accent, 0.15),
      'accent-lighten-2': lighten(dark.accent, 0.25),
      'warning': dark.accent,
      'warning-darken-1': darken(dark.accent, 0.15),
      'warning-darken-2': darken(dark.accent, 0.25),
      'warning-lighten-1': lighten(dark.accent, 0.15),
      'warning-lighten-2': lighten(dark.accent, 0.25),

      // Cores neutras para tema escuro
      'neutral': dark.outline,
      'neutral-darken-1': darken(dark.outline, 0.15),
      'neutral-darken-2': darken(dark.outline, 0.25),
      'neutral-darken-3': darken(dark.outline, 0.35),
      'neutral-darken-4': darken(dark.outline, 0.45),
      'neutral-lighten-1': lighten(dark.outline, 0.15),
      'neutral-lighten-2': lighten(dark.outline, 0.25),
      'neutral-lighten-3': lighten(dark.outline, 0.35),
      'neutral-lighten-4': lighten(dark.outline, 0.45),
      'neutral-lighten-5': lighten(dark.outline, 0.55),

      // Tons de gris para tema escuro
      'grey': '#616161',
      'grey-darken-1': '#424242',
      'grey-darken-2': '#303030',
      'grey-darken-3': '#212121',
      'grey-darken-4': '#121212',
      'grey-lighten-1': '#757575',
      'grey-lighten-2': '#9E9E9E',
      'grey-lighten-3': '#BDBDBD',
      'grey-lighten-4': '#E0E0E0',
      'grey-lighten-5': '#F5F5F5',

      // Backgrounds escuros
      'background': dark.background,
      'surface': dark.surface,
      'surface-variant': dark.surfaceVariant,
      'surface-bright': lighten(dark.surface, 0.15),
      'surface-dim': dark.background,
      'surface-container': lighten(dark.surface, 0.05),
      'surface-container-high': lighten(dark.surface, 0.10),
      'surface-container-highest': lighten(dark.surface, 0.15),
      'surface-container-low': darken(dark.surface, 0.05),
      'surface-container-lowest': darken(dark.background, 0.05),

      // Cores funcionais para tema escuro
      'error': '#CF6679',
      'error-darken-1': '#B00020',
      'error-lighten-1': '#EF5350',
      'info': dark.secondary,
      'info-darken-1': darken(dark.secondary, 0.15),
      'info-lighten-1': lighten(dark.secondary, 0.15),
      'success': '#81C784',
      'success-darken-1': '#4CAF50',
      'success-lighten-1': '#A5D6A7',

      // Textos para tema escuro
      'on-primary': darken(cfg.theme?.primary || '#1E3A8A', 0.10),
      'on-secondary': darken(cfg.theme?.secondary || '#2563EB', 0.10),
      'on-accent': darken(cfg.theme?.accent || '#FBBF24', 0.50),
      'on-background': dark.text,
      'on-surface': dark.text,
      'on-surface-variant': dark.muted,
      'on-neutral': '#FFFFFF',
      'on-neutral-darken-3': lighten(dark.outline, 0.35),
      'outline': dark.outline,
      'outline-variant': darken(dark.outline, 0.25),
      'inverse-on-surface': dark.background,
      'inverse-surface': dark.text,
      'inverse-primary': cfg.theme?.primary || '#1E3A8A',
      'shadow': '#000000',
      'scrim': '#000000',
    },
    variables: {
      'font-family': '\'Gotham Medium\', \'Poppins\', \'Roboto\', \'Helvetica\', \'Arial\', sans-serif',
      'border-color': darken(dark.outline, 0.25),
      'border-opacity': 0.20,
      'high-emphasis-opacity': 0.95,
      'medium-emphasis-opacity': 0.70,
      'disabled-opacity': 0.50,
      'idle-opacity': 0.06,
      'hover-opacity': 0.12,
      'focus-opacity': 0.16,
      'selected-opacity': 0.16,
      'activated-opacity': 0.20,
      'pressed-opacity': 0.20,
      'dragged-opacity': 0.12,
      'theme-kbd': dark.text,
      'theme-on-kbd': dark.background,
      'theme-code': dark.surfaceVariant,
      'theme-on-code': dark.text,
      'shadow-key-umbra-opacity': 0.3,
      'shadow-key-penumbra-opacity': 0.2,
      'shadow-key-ambient-opacity': 0.15,
    },
  }
}

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    ssr: true, // Habilitar SSR para resolver problemas de hidratação
    components: {
      VCalendar,
    },
    theme: {
      defaultTheme: 'cidadeTema',
      themes: {
        cidadeTema: createCidadeTema(),
        cidadeTemaEscuro: createCidadeTemaEscuro(),
      },
    },
    icons: {
      defaultSet: 'mdi', // 'fluentColor'
      sets: {
        fluentColor: {
          component: Icon as any,
        },
      },
    },
    defaults: {
      VBtn: {
        rounded: 'lg',
        color: 'primary',
        style: 'text-transform: none;',
      },
      VCard: {
        rounded: 'lg',
        color: 'surface',
      },
      VAppBar: {
        color: 'primary',
      },
      VNavigationDrawer: {
        color: 'surface',
      },
      VChip: {
        color: 'accent',
        rounded: 'lg',
      },
      VAlert: {
        rounded: 'lg',
      },
      VSheet: {
        color: 'surface',
      },
      VDialog: {
        rounded: 'lg',
      },
      VMenu: {
        rounded: 'lg',
      },
      VTooltip: {
        color: 'neutral-darken-2',
      },
      VBanner: {
        rounded: 'lg',
      },
      VExpansionPanels: {
        rounded: 'lg',
      },
      VTabs: {
        color: 'surface',
      },
      VTextField: {
        variant: 'outlined',
        rounded: 'lg',
      },
      VTextarea: {
        variant: 'outlined',
        rounded: 'lg',
      },
      VSelect: {
        variant: 'outlined',
        rounded: 'lg',
      },
      VAutocomplete: {
        variant: 'outlined',
        rounded: 'lg',
      },
    },
  })

  app.vueApp.use(vuetify)
})
