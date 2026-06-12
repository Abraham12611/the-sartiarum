export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-screen bg-[#FAF7F0]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#141516] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
          Sartiarum
        </h1>
        <p className="text-[#4F5963]" style={{ fontFamily: 'Inter, sans-serif' }}>
          Scaffold ready. Fill .env.local and run <code className="bg-gray-100 px-1 rounded">pnpm dev</code>.
        </p>
      </div>
    </div>
  )
}
