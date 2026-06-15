import { Skeleton } from '@/components/ui/skeleton'

export default function WriterLoading() {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <div className="w-[280px] shrink-0 border-r border-[#ede8e1] bg-[#faf9f7] p-4">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="mt-6 h-28 w-full rounded-xl" />
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Skeleton className="h-9 rounded-lg" />
          <Skeleton className="h-9 rounded-lg" />
          <Skeleton className="h-9 rounded-lg" />
          <Skeleton className="h-9 rounded-lg" />
        </div>
      </div>

      <div className="w-[48px] shrink-0 border-r border-[#ede8e1] bg-[#faf9f7] p-3">
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>

      <div className="min-w-0 flex-1 p-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="mt-3 h-[74vh] w-full rounded-xl" />
      </div>
    </div>
  )
}
