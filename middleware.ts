import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    '/',              // Root path
    '/:id',           // Any single-segment path like /about
    '/api/:path*',    // All API routes and their subpaths
    '/login',         // Login page
    '/register',      // Registration page
    '/chat/:chat*',   // All chat-related paths and subpaths
  ],
};
