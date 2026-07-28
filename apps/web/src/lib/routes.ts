// Typed route constants (Frontend_Architecture.md section 4). Only routes
// this phase actually builds -- see PROJECT_STATUS.md for the rest of
// ROADMAP.md's Phase 8 page list (Trending/Videos/Channels/Trends/
// Opportunities/Search/Export/Billing/Admin panel/Onboarding), deferred
// because their backing endpoints or data don't exist yet.
export const ROUTES = {
  home: '/home',
  watchlists: '/watchlists',
  alerts: '/alerts',
  settings: {
    profile: '/settings/profile',
    organisation: '/settings/organisation',
    apiKeys: '/settings/api-keys',
  },
  admin: {
    prompts: '/admin/prompts',
  },
  auth: {
    login: '/login',
    register: '/register',
    verifyEmail: '/verify-email',
    // /reset-password/confirm (not a flat /forgot-password + /reset-password
    // split) because auth.service.ts hardcodes
    // `${appUrl}/reset-password/confirm?token=...` in the actual reset
    // email -- confirmed live, this must match exactly.
    resetPasswordRequest: '/reset-password',
    resetPasswordConfirm: '/reset-password/confirm',
  },
} as const;
