import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="grid h-full min-h-0 w-full grid-cols-1 xl:grid-cols-[minmax(0,1fr)_272px] xl:gap-x-5 xl:px-3">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-4 pb-3 pt-3 xl:px-5 2xl:px-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Skeleton className="h-9 w-36 rounded-xl" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-56 rounded-xl" />
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>

        <div className="mb-3 space-y-2">
          <Skeleton className="h-10 w-80 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>

        <div className="mb-3 flex items-center gap-2">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>

        <Skeleton className="h-[180px] rounded-2xl" />

        <div className="mt-3 grid grid-cols-1 gap-2.5 xl:grid-cols-3">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      </section>

      <aside className="hidden h-full w-[272px] shrink-0 xl:flex xl:flex-col xl:gap-2.5 xl:px-2.5 xl:pb-2.5 xl:pt-[74px]">
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-9 rounded-xl" />
      </aside>
    </div>
  )
}
