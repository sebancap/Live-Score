'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Grid, ListTodo, Trophy } from 'lucide-react'
import clsx from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Groups', href: '/admin/groups', icon: Users },
  { name: 'Categories', href: '/admin/categories', icon: Grid },
  { name: 'Programs', href: '/admin/programs', icon: ListTodo },
  { name: 'Mark Entry', href: '/admin/marks', icon: Trophy },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <aside className="w-64 bg-indigo-900 border-r border-indigo-800 hidden md:flex flex-col shadow-xl z-10 text-indigo-100">
        <div className="h-20 flex items-center px-6 border-b border-indigo-800 bg-indigo-950 font-black text-2xl tracking-tight text-white shadow-sm">
          LiveScore
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-indigo-200 hover:bg-indigo-800 hover:text-white',
                  'group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200'
                )}
              >
                <item.icon
                  className={clsx(
                    isActive ? 'text-white' : 'text-indigo-400 group-hover:text-indigo-200',
                    'mr-4 flex-shrink-0 h-5 w-5 transition-colors'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-indigo-800 text-xs text-indigo-400 text-center">
          Admin Dashboard
        </div>
      </aside>
      
      <main className="flex-1 bg-slate-50 relative overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex h-16 bg-indigo-900 shadow-md items-center px-4 font-bold text-xl text-white">
          LiveScore Admin
        </div>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
