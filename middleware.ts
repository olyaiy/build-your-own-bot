import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/webhook (Stripe webhook endpoint)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - fonts/ (font files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/webhook|_next/static|_next/image|fonts|favicon.ico).*)',
  ],
};
