import './globals.css';
import { cookies } from 'next/headers';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import Script from 'next/script';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { auth } from './(auth)/auth';
import { MainHeader } from '@/components/main-header';

export const experimental_ppr = true;

const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? 'hsl(240 10% 3.9%)' : 'hsl(0 0% 100%)');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export const metadata = {
  title: 'AI Assistant Platform',
  description: 'Next-generation AI agent development environment',
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';
  const isLoggedIn = !!session?.user;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
        <Script
          src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" richColors />
          {isLoggedIn ? (
            <SidebarProvider defaultOpen={!isCollapsed}>
              <AppSidebar user={session.user} />
              <SidebarInset>
                {children}
              </SidebarInset>
            </SidebarProvider>
          ) : (
            <div className="w-full">
              {children}
            </div>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
