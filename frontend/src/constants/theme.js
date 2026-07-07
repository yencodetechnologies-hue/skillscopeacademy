/**
 * JS theme constants — mirror of tokens.css for inline styles in JSX.
 * Keep in sync with --color-* values in src/styles/tokens.css.
 */
export const colors = {
  brandPrimary: '#F5A623',
  brandAccent: '#00796B',
  brandDark: '#0a1d33',
  brandPrimaryHover: '#D4920E',
  brandAccentHover: '#00695C',
  brandLight: '#FFF4D6',
  brandTint: '#FFF8E7',
  brandOnPrimary: '#1a1d2e',

  success: '#16a34a',
  successBg: '#dcfce7',
  successAlt: '#10b981',
  successDark: '#15803d',
  successBorder: '#bbf7d0',
  successPanel: '#f0fdf4',
  error: '#dc2626',
  errorBg: '#fee2e2',
  errorAlt: '#ef4444',
  errorDark: '#b91c1c',
  errorBorder: '#fecaca',
  warning: '#ca8a04',
  warningBg: '#fef9c3',
  warningAlt: '#f59e0b',
  info: '#00796B',
  infoBg: '#E0F2F1',
  infoHover: '#00695C',
  infoBorder: '#80CBC4',
  orange: '#f97316',

  navyDeep: '#0d2240',
  navyMid: '#0a4d7a',
  navyHero: '#0f1e3d',
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate600: '#475569',
  slate500: '#64748b',
  slate100: '#f1f5f9',
  slate50: '#f8fafc',

  textPrimary: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  textSubtle: '#94a3b8',
  textBody: '#444444',
  textDim: '#555555',
  textFaint: '#666666',
  textIcon: '#888888',
  border: '#e5e7eb',
  borderLight: '#e2e8f0',
  borderMuted: '#dddddd',
  borderSoft: '#eeeeee',
  borderInput: '#d1d5db',
  surface: '#ffffff',
  bg: '#f9fafb',
  bgAlt: '#f4f5fa',
  bgMuted: '#f3f4f6',
  bgSubtle: '#fafafa',
  bgPanel: '#f0f0f0',

  cyanAccent: '#00796B',
  linkMuted: '#4a7096',
  skyLight: '#bae0f7',
  skyWash: '#e8f4fd',
  skyPanel: '#f0f8ff',
  skyHighlight: '#f0faff',
  panelBlue: '#eef2f7',

  white: '#ffffff',
  black: '#000000',
};

export const statusColors = {
  competent: { color: colors.success, bg: colors.successBg },
  notCompetent: { color: colors.error, bg: colors.errorBg },
  notYetCompetent: { color: colors.error, bg: colors.errorBg },
  pending: { color: colors.warning, bg: colors.warningBg },
  inProgress: { color: colors.info, bg: colors.infoBg },
};

export const scheduleTypeColors = {
  theory: { color: colors.brandPrimary, bg: colors.brandTint },
  practical: { color: colors.brandPrimary, bg: colors.brandLight },
  exam: { color: colors.successAlt, bg: colors.successBg },
};

/** Read a CSS token from :root at runtime (for dynamic sync with tokens.css). */
export function cssVar(name) {
  if (typeof document === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
