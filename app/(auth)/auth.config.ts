import type { NextAuthConfig } from 'next-auth';

// Set this to false to temporarily disable registrations
const ENABLE_REGISTRATION = true;

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
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isOnRegister = nextUrl.pathname.startsWith('/register');

      // If user is logged in and tries to access login/register pages, redirect to home
      if (isLoggedIn && (isOnLogin || isOnRegister)) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      // Handle registration page access based on ENABLE_REGISTRATION flag
      if (isOnRegister && !ENABLE_REGISTRATION) {
        // Redirect to login page when registrations are disabled
        return Response.redirect(new URL('/login', nextUrl as unknown as URL));
      }

      // Allow access to all other routes regardless of authentication status
      return true;
    },
  },
} satisfies NextAuthConfig;
