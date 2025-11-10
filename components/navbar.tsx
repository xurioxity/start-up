"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings,
  Package,
  BarChart3,
  Upload,
  FileText,
  MessageSquare,
  Bell,
  Factory,
  Users,
  ShoppingCart
} from "lucide-react"
import { NotificationButton } from "@/components/notification-button"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { data: session, status } = useSession()

  const sellerNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "My Store", href: "/store", icon: Package },
    { name: "E-Commerce", href: "/ecommerce", icon: FileText },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Upload", href: "/upload", icon: Upload },
  ]

  const manufacturerNavigation = [
    { name: "Dashboard", href: "/mfg/dashboard", icon: Factory },
    { name: "Orders", href: "/mfg/orders", icon: Package },
    { name: "Sellers", href: "/mfg/sellers", icon: Users },
    { name: "Messages", href: "/mfg/messages", icon: MessageSquare },
    { name: "E-Commerce", href: "/mfg/ecommerce", icon: ShoppingCart, comingSoon: true },
  ]

  const navigation = session?.user?.role === "MANUFACTURER" ? manufacturerNavigation : sellerNavigation

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={session && session.user ? (session.user.role === "MANUFACTURER" ? "/mfg/dashboard" : "/dashboard") : "/"} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold gradient-text">Aavi 3D</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {status === "loading" ? (
              <div className="animate-pulse">
                <div className="h-4 w-20 bg-muted rounded"></div>
              </div>
            ) : session && session.user ? (
              <>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    {item.name === "Messages" && unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-1 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                    {(item as any).comingSoon && (
                      <Badge variant="outline" className="ml-1 text-xs text-yellow-400 border-yellow-400">
                        Coming Soon
                      </Badge>
                    )}
                  </Link>
                ))}
              </>
            ) : null}
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {status === "loading" ? (
              <div className="animate-pulse">
                <div className="h-8 w-8 bg-muted rounded"></div>
              </div>
            ) : session && session.user ? (
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="hidden sm:flex">
                  {session.user?.role === "MANUFACTURER" ? "MANUFACTURER" : "SELLER"}
                </Badge>
                {session.user?.id && <NotificationButton userId={session.user.id} />}
                <div className="relative group">
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="w-5 h-5" />
                  </Button>
                  <div className="absolute right-0 mt-2 w-48 bg-popover border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-muted-foreground border-b">
                        {session.user?.email}
                      </div>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm hover:bg-accent"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t">
              {status === "loading" ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-8 w-full bg-muted rounded"></div>
                  <div className="h-8 w-full bg-muted rounded"></div>
                </div>
              ) : session && session.user ? (
                <>
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                      {item.name === "Messages" && unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-1 text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                      {(item as any).comingSoon && (
                        <Badge variant="outline" className="ml-1 text-xs text-yellow-400 border-yellow-400">
                          Coming Soon
                        </Badge>
                      )}
                    </Link>
                  ))}
                  <div className="border-t pt-2">
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      {session.user?.email}
                    </div>
                    <button
                      onClick={() => {
                        signOut()
                        setIsOpen(false)
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="sm">Sign In</Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                      <Button size="sm">Get Started</Button>
                    </Link>
                  </div>
                  <ThemeToggle />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}