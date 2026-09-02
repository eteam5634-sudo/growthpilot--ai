import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
