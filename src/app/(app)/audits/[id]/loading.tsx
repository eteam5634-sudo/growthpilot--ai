import { Skeleton } from "@/components/ui/skeleton";

export default function ReportLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-72" />
      <div className="grid gap-4 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-36" />
        ))}
      </div>
    </div>
  );
}
