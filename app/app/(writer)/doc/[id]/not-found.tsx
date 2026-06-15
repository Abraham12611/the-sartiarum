import Link from 'next/link'

export default function DocumentNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbf8f2] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#e7dfd3] bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-[#171b19]">Document unavailable</h1>
        <p className="mt-2 text-sm text-[#616a62]">
          This document was not found or you do not have access to it.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/app"
            className="inline-flex h-9 items-center rounded-lg bg-[#2f6e1f] px-4 text-sm font-semibold text-white hover:bg-[#285e1b]"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
