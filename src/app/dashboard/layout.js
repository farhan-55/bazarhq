'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', exact: true },
  { label: 'Products', href: '/dashboard/products', exact: false },
  { label: 'Orders', href: '/dashboard/orders', exact: false },
  { label: 'Analytics', href: '/dashboard/analytics', exact: false },
  { label: 'Notifications', href: '/dashboard/notifications', exact: false },
  { label: 'Settings', href: '/dashboard/settings', exact: false },
  { label: 'Account', href: '/dashboard/account', exact: false },
]

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (item) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <div className="min-h-screen bg-[#F7EFE0]">
      <div className="bg-[#2B2420] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setOpen(!open)}
          className="text-[#FBF6EC] w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#3A332C] transition-colors"
          aria-label="Toggle menu"
        >
          <span className="text-lg">{open ? 'x' : '≡'}</span>
        </button>
        <p className="text-sm text-[#FBF6EC] font-medium">BazarHQ - Merchant</p>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 z-40"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#2B2420] z-50 transform transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-5 flex items-center justify-between">
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-[#8A7C63] font-medium">
              BazarHQ
            </p>
            <p className="text-sm text-[#FBF6EC] font-medium mt-0.5">Merchant</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-[#B8AA90] hover:text-[#FBF6EC] w-8 h-8 flex items-center justify-center"
            aria-label="Close menu"
          >
            x
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item)
                  ? 'bg-[#A6472F] text-[#FBF6EC]'
                  : 'text-[#B8AA90] hover:bg-[#3A332C] hover:text-[#FBF6EC]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="min-w-0">{children}</main>
    </div>
  )
}