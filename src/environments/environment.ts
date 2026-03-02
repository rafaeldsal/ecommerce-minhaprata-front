export const environment = {
  apiUrl: 'http://localhost:8080/ws-minha-prata',
  production: false,
  apiTimeout: 10000,
  // Google OAuth
  googleClientId: '',

  // URLs de callback
  authCallbackUrls: {
    google: 'http://localhost:4200/auth/google/callback'
  }
};
