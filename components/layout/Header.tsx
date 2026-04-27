'use client'

import Link from 'next/link'
import { signOut } from '@/app/actions'

interface HeaderProps {
  userEmail: string | null
  logoSrc:   string
}

export default function Header({ userEmail, logoSrc }: HeaderProps) {
  const initial = userEmail ? userEmail[0].toUpperCase() : '?'

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-brand-strong flex items-center justify-between px-5 h-[52px]">
      {/* Left: logo + title */}
      <Link href="/" className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt="MyUpdates Logo"
          width={36}
          height={36}
          className="rounded-lg object-cover"
          style={{ width: 36, height: 36, flexShrink: 0 }}
        />
        <span className="text-base font-semibold text-app-text">
          My <span className="text-brand-strong">Updates</span>
        </span>
      </Link>

      {/* Right: profile avatar + logout */}
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-app-text text-sm font-semibold"
          title={userEmail ?? 'Profile'}
        >
          {initial}
        </Link>

        <form action={signOut}>
          <button
            type="submit"
            className="text-xs text-app-muted hover:text-brand-strong transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  )
}
