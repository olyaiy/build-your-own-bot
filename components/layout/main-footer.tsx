import { Logo } from "@/components/logo";

export function MainFooter() {
  return (
    <footer className="w-full border-t py-6 mt-8">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4">
        <Logo className="text-foreground" spanClassName="text-lg" />
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} All rights reserved
        </div>
      </div>
    </footer>
  );
} 