import { Skeleton } from "@/components/ui/skeleton";

export default function NewAuditLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-80" />
    </div>
  );
}
