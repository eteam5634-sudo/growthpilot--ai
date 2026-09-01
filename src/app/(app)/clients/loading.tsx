import { Skeleton } from "@/components/ui/skeleton";

export default function ClientsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <Skeleton className="h-8 w-40" />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-64" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
