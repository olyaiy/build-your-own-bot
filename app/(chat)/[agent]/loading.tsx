import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col min-w-0 h-dvh overflow-hidden bg-background">
      {/* Skeleton header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Skeleton content area (like Overview component) */}
      <div className="flex flex-col h-full justify-center items-center px-4 md:px-8 gap-6">
        <div className="w-full md:max-w-3xl">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </div>
        
        {/* Skeleton input area */}
        <div className="w-full md:max-w-3xl">
          <div className="border rounded-lg p-4">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
