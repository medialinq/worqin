"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import {
  LayoutDashboard,
  Clock,
  Calendar,
  Users,
  Receipt,
  TrendingUp,
  Download,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Menu,
} from "lucide-react"
import { BRAND } from "@/config/brand"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { mockCalendarEvents } from "@/lib/mock"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"

const NAV_ITEMS = [
  { key: "dashboard" as const, icon: LayoutDashboard, href: "/dashboard" },
  { key: "timeline" as const, icon: Clock, href: "/timeline" },
  { key: "agenda" as const, icon: Calendar, href: "/calendar" },
  { key: "clients" as const, icon: Users, href: "/customers" },
  { key: "expenses" as const, icon: Receipt, href: "/expenses" },
  { key: "financial" as const, icon: TrendingUp, href: "/financial/cashflow" },
  { key: "export" as const, icon: Download, href: "/export" },
] as const

const SETTINGS_ITEM = {
  key: "settings" as const,
  icon: Settings,
  href: "/settings",
}

function NavLink({
  item,
  isActive,
  collapsed,
  label,
  onClick,
  badge,
}: {
  item: { key: string; icon: React.ComponentType<{ className?: string }>; href: string }
  isActive: boolean
  collapsed: boolean
  label: string
  onClick?: () => void
  badge?: number
}) {
  const Icon = item.icon

  const link = (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
      )}
      <span className="relative">
        <Icon className={cn("size-5 shrink-0", collapsed ? "" : "ml-1")} />
        {badge != null && badge > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            {badge}
          </span>
        )}
      </span>
      {!collapsed && <span>{label}</span>}
      {!collapsed && badge != null && badge > 0 && (
        <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white">
          {badge}
        </span>
      )}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={<div />}>
          {link}
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    )
  }

  return link
}

function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const t = useTranslations("nav")
  const tTheme = useTranslations("theme")
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  // Count unconfirmed calendar events for agenda badge
  const unconfirmedCount = mockCalendarEvents.filter((evt) => !evt.confirmedAt).length

  const getBadge = (key: string): number | undefined => {
    if (key === "agenda" && unconfirmedCount > 0) return unconfirmedCount
    return undefined
  }

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-surface-border px-4 shrink-0",
          collapsed && "justify-center px-2"
        )}
      >
        {collapsed ? (
          <span className="text-lg font-bold text-primary">
            {BRAND.name.charAt(0)}
          </span>
        ) : (
          <span className="text-lg font-bold tracking-tight text-foreground">
            {BRAND.name}
          </span>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.key}
            item={item}
            isActive={isActive(item.href)}
            collapsed={collapsed}
            label={t(item.key)}
            onClick={onNavigate}
            badge={getBadge(item.key)}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="shrink-0 p-3">
        <Separator className="mb-3" />

        {/* Settings */}
        <NavLink
          item={SETTINGS_ITEM}
          isActive={isActive(SETTINGS_ITEM.href)}
          collapsed={collapsed}
          label={t(SETTINGS_ITEM.key)}
          onClick={onNavigate}
        />

        {/* Theme toggle */}
        <div className={cn("mt-2", collapsed && "flex justify-center")}>
          {mounted && (
            <Button
              variant="ghost"
              size={collapsed ? "icon" : "default"}
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className={cn(
                "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
                collapsed && "w-auto justify-center"
              )}
            >
              {resolvedTheme === "dark" ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
              {!collapsed && (
                <span className="text-sm">
                  {resolvedTheme === "dark" ? tTheme("light") : tTheme("dark")}
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const tSidebar = useTranslations("sidebar")

  return (
    <>
      {/* Mobile topbar */}
      <header className="z-40 flex h-14 shrink-0 items-center border-b border-surface-border bg-surface px-4 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          aria-label={tSidebar("openMenu")}
        >
          <Menu className="size-5" />
        </Button>
        <span className="mx-auto text-lg font-bold tracking-tight text-foreground">
          {BRAND.name}
        </span>
        {/* Placeholder for future notifications icon */}
        <div className="size-8" />
      </header>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[280px] p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">{BRAND.name}</SheetTitle>
          <SidebarNav collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex md:flex-col md:shrink-0 border-r border-surface-border bg-surface transition-all duration-200 ease-in-out h-screen sticky top-0",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className="relative flex-1 overflow-hidden">
          <SidebarNav collapsed={collapsed} />

          {/* Collapse toggle */}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setCollapsed(!collapsed)}
            className="absolute right-0 top-[18px] translate-x-1/2 z-10 rounded-full border border-surface-border bg-surface shadow-sm"
            aria-label={collapsed ? tSidebar("expandSidebar") : tSidebar("collapseSidebar")}
          >
            {collapsed ? (
              <ChevronRight className="size-3" />
            ) : (
              <ChevronLeft className="size-3" />
            )}
          </Button>
        </div>
      </aside>
    </>
  )
}
