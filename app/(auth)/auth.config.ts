import type { NextAuthConfig } from 'next-auth';

// Set this to false to temporarily disable registrations
const ENABLE_REGISTRATION = false;

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnChat = nextUrl.pathname.startsWith('/');
      const isOnRegister = nextUrl.pathname.startsWith('/register');
      const isOnLogin = nextUrl.pathname.startsWith('/login');

      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      // Handle registration page access based on ENABLE_REGISTRATION flag
      if (isOnRegister) {
        if (ENABLE_REGISTRATION) {
          return true; // Allow access to registration page if enabled
        } else {
          // Redirect to login page when registrations are disabled
          return Response.redirect(new URL('/login', nextUrl as unknown as URL));
        }
      }

      if (isOnLogin) {
        return true; // Always allow access to login page
      }

      if (isOnChat) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      if (isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
