import { Skeleton } from "@/components/ui/skeleton";
import AppLayout from "@/components/AppLayout";

interface PageLoadingSkeletonProps {
  /** Type of page skeleton to show */
  variant?: "dashboard" | "interview" | "form" | "detail";
  /** Whether to wrap in AppLayout */
  withLayout?: boolean;
  /** Show minimal footer in layout */
  showFooter?: boolean;
}

const DashboardSkeleton = () => (
  <div className="space-y-8">
    {/* Stats row */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-6 rounded-xl bg-card border border-border">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>

    {/* Tabs */}
    <Skeleton className="h-10 w-64" />

    {/* Table header */}
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <Skeleton className="h-6 w-32" />
      </div>
      {/* Table rows */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-4 border-b border-border last:border-0">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  </div>
);

const InterviewSkeleton = () => (
  <div className="max-w-3xl mx-auto space-y-6">
    {/* Header info */}
    <div className="text-center space-y-2">
      <Skeleton className="h-8 w-64 mx-auto" />
      <Skeleton className="h-4 w-48 mx-auto" />
    </div>

    {/* Chat messages */}
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className={`flex items-start gap-3 ${i % 2 === 1 ? "flex-row-reverse" : ""}`}>
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <Skeleton className={`h-20 rounded-2xl ${i % 2 === 1 ? "w-2/3" : "w-3/4"}`} />
        </div>
      ))}
    </div>

    {/* Input area */}
    <div className="flex gap-2">
      <Skeleton className="flex-1 h-12 rounded-xl" />
      <Skeleton className="w-12 h-12 rounded-xl" />
    </div>
  </div>
);

const FormSkeleton = () => (
  <div className="max-w-2xl mx-auto space-y-8">
    {/* Title */}
    <div className="text-center space-y-2">
      <Skeleton className="h-8 w-48 mx-auto" />
      <Skeleton className="h-4 w-64 mx-auto" />
    </div>

    {/* Form card */}
    <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}

      {/* Text area */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>

      {/* Button */}
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  </div>
);

const DetailSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-6">
    {/* Breadcrumb */}
    <Skeleton className="h-4 w-48" />

    {/* Title section */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>

    {/* Content cards */}
    <div className="grid md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-card rounded-xl border border-border p-6 space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SkeletonContent = ({ variant = "dashboard" }: { variant: PageLoadingSkeletonProps["variant"] }) => {
  switch (variant) {
    case "interview":
      return <InterviewSkeleton />;
    case "form":
      return <FormSkeleton />;
    case "detail":
      return <DetailSkeleton />;
    case "dashboard":
    default:
      return <DashboardSkeleton />;
  }
};

const PageLoadingSkeleton = ({ 
  variant = "dashboard", 
  withLayout = true,
  showFooter = false 
}: PageLoadingSkeletonProps) => {
  if (!withLayout) {
    return <SkeletonContent variant={variant} />;
  }

  return (
    <AppLayout footer={showFooter ? "minimal" : "none"}>
      <SkeletonContent variant={variant} />
    </AppLayout>
  );
};

export default PageLoadingSkeleton;
