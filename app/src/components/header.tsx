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
  Sparkles,
  RefreshCw,
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
    { href: '/proof/upload', label: '上传凭证', icon: Brain },
  ]

  const navItems = role === 'beneficiary' ? beneficiaryNav : donorNav

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E8E2D9] bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#C4866B] to-[#D4A59A] shadow-sm group-hover:shadow-md transition-shadow">
            <span className="text-lg">🌸</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold she3-logo">
              SHE<sup>³</sup>
            </span>
            <span className="text-[10px] text-[#B8A99A] -mt-0.5 hidden sm:block">为她赋能</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        {isRoleSelected && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-[#5D4E47] hover:text-[#C4866B] transition-colors px-4 py-2 rounded-lg hover:bg-[#F5F2ED] flex items-center gap-1.5"
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
                className={`cursor-pointer transition-all ${
                  role === 'beneficiary'
                    ? 'badge-sage'
                    : 'badge-terracotta'
                } hover:opacity-80`}
                onClick={clearRole}
              >
                {role === 'beneficiary' ? (
                  <><Sparkles className="w-3 h-3 mr-1" />项目发起人</>
                ) : (
                  <><Heart className="w-3 h-3 mr-1" />支持者</>
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
                          className="btn-warm rounded-full px-5"
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
                          className="rounded-full"
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
                          className="hidden sm:flex border-[#E8E2D9] bg-[#F5F2ED] text-[#5D4E47] hover:bg-[#E8E2D9] rounded-full"
                        >
                          {chain.name}
                        </Button>
                        <Button
                          onClick={openAccountModal}
                          variant="outline"
                          size="sm"
                          className="border-[#E8E2D9] bg-white text-[#5D4E47] hover:bg-[#F5F2ED] rounded-full"
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
            className="md:hidden p-2 text-[#5D4E47] hover:text-[#C4866B] rounded-lg hover:bg-[#F5F2ED]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && isRoleSelected && (
        <div className="md:hidden border-t border-[#E8E2D9] bg-white">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-[#5D4E47] hover:text-[#C4866B] py-2 px-3 rounded-lg hover:bg-[#F5F2ED]"
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-[#E8E2D9]">
              <button
                onClick={() => {
                  clearRole()
                  setMobileMenuOpen(false)
                }}
                className="flex items-center gap-2 text-[#B8A99A] hover:text-[#5D4E47] py-2 px-3 w-full"
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
