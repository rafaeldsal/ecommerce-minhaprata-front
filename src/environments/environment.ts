export const environment = {
  apiUrl: 'http://localhost:8080/ws-minha-prata',
  production: false,
  apiTimeout: 10000,
  // Google OAuth
  googleClientId: '582265646047-c2r3um1o38tad4bjkbq8qm5nkru4fbln.apps.googleusercontent.com',

  // URLs de callback
  authCallbackUrls: {
    google: 'http://localhost:4200/auth/google/callback'
  }
};
