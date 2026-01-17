'use client'

import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  LayoutDashboard,
  FileCheck,
  Brain,
  Menu,
  X,
  HandHeart,
  RefreshCw,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'
import { useUser } from '@/lib/user-context'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { role, clearRole, isRoleSelected } = useUser()

  const donorNav = [
    { href: '/campaigns', label: '探索项目' },
    { href: '/dashboard/donor', label: '我的捐赠', icon: LayoutDashboard },
  ]

  const beneficiaryNav = [
    { href: '/dashboard/beneficiary', label: '项目管理', icon: FileCheck },
    { href: '/proof/upload', label: '上传凭证申请提款', icon: Brain },
  ]

  const navItems = role === 'beneficiary' ? beneficiaryNav : donorNav

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-500/20 bg-slate-950/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500">
            <Heart className="h-5 w-5 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            GiveFlow
          </span>
        </Link>

        {/* Desktop Navigation */}
        {isRoleSelected && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-slate-400 hover:text-emerald-400 transition-colors px-3 py-2 rounded-md hover:bg-slate-800/50 flex items-center gap-1.5"
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Role Badge & Switch */}
          {isRoleSelected && (
            <div className="hidden md:flex items-center gap-2">
              <Badge
                className={`cursor-pointer ${
                  role === 'beneficiary'
                    ? 'bg-teal-500/10 text-teal-400 border-teal-500/30 hover:bg-teal-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                }`}
                onClick={clearRole}
              >
                {role === 'beneficiary' ? (
                  <><HandHeart className="w-3 h-3 mr-1" />募捐者</>
                ) : (
                  <><Heart className="w-3 h-3 mr-1" fill="currentColor" />捐赠者</>
                )}
                <RefreshCw className="w-3 h-3 ml-1.5 opacity-60" />
              </Badge>
            </div>
          )}

          {/* Connect Wallet */}
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted
              const connected = ready && account && chain

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <Button
                          onClick={openConnectModal}
                          size="sm"
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                        >
                          连接钱包
                        </Button>
                      )
                    }

                    if (chain.unsupported) {
                      return (
                        <Button
                          onClick={openChainModal}
                          variant="destructive"
                          size="sm"
                        >
                          切换网络
                        </Button>
                      )
                    }

                    return (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={openChainModal}
                          variant="outline"
                          size="sm"
                          className="hidden sm:flex border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        >
                          {chain.name}
                        </Button>
                        <Button
                          onClick={openAccountModal}
                          variant="outline"
                          size="sm"
                          className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-700"
                        >
                          {account.displayName}
                        </Button>
                      </div>
                    )
                  })()}
                </div>
              )
            }}
          </ConnectButton.Custom>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && isRoleSelected && (
        <div className="md:hidden border-t border-emerald-500/20 bg-slate-950/95 backdrop-blur-xl">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 py-2 px-3 rounded-lg hover:bg-slate-800/50"
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  clearRole()
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-300 py-2 px-3 w-full"
              >
                <RefreshCw className="h-4 w-4" />
                切换角色
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
