import { Logo } from "@/components/logo";
import Link from "next/link";

export function MainFooter() {
  return (
    <footer className="w-full border-t py-6 mt-8">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4">
        <Logo className="text-foreground" spanClassName="text-lg" />
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} All rights reserved
          </div>
        </div>
      </div>
    </footer>
  );
} 