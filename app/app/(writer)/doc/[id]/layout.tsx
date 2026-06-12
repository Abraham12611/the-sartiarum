// Focus shell — no sidebar. Overrides the dashboard layout for writer routes.
export default function WriterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fff', fontFamily: 'Inter, sans-serif' }}>
      {children}
    </div>
  )
}
