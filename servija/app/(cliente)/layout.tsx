import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar role="CLIENTE" />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
