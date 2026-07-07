/**
 * JS theme constants — mirror of tokens.css for inline styles in JSX.
 * Keep in sync with --color-* values in src/styles/tokens.css.
 */
export const colors = {
  brandPrimary: '#F57C00',
  brandAccent: '#0a1d33',
  brandDark: '#0a1d33',
  brandPrimaryHover: '#E65100',
  brandLight: '#FFF3E0',
  brandTint: '#FFE0B2',
  brandOnPrimary: '#1a1d2e',

  success: '#16a34a',
  successBg: '#dcfce7',
  successAlt: '#10b981',
  error: '#dc2626',
  errorBg: '#fee2e2',
  errorAlt: '#ef4444',
  warning: '#ca8a04',
  warningBg: '#fef9c3',
  warningAlt: '#f59e0b',
  info: '#2563eb',
  infoBg: '#dbeafe',
  infoHover: '#1d4ed8',
  orange: '#f97316',

  textPrimary: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  textSubtle: '#94a3b8',
  border: '#e5e7eb',
  borderLight: '#e2e8f0',
  surface: '#ffffff',
  bg: '#f9fafb',
  bgAlt: '#f4f5fa',
  bgMuted: '#f3f4f6',

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
  theory: { color: colors.brandPrimary, bg: '#FFF3E0' },
  practical: { color: colors.brandPrimary, bg: '#FFE0B2' },
  exam: { color: colors.successAlt, bg: colors.successBg },
};

