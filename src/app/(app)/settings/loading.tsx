import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-72" />
    </div>
  );
}
