import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { navLinks } from '@/constants'
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import Image from '@/components/ui/Image'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const MobileNav = () => {
  const location = useLocation()

  return (
    <header className="header">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 md:py-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-gradient flex items-center justify-center">
            <span className="text-white font-bold text-sm">I</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            IMAGINIFY
          </span>
        </div>
      </Link>

      <nav className="flex gap-2 items-center">
        <SignedIn>
          {/* User Button */}
          <UserButton 
            afterSignOutUrl="/" 
            appearance={{
              elements: {
                userButtonBox: "flex-row-reverse gap-2",
                userButtonOuterIdentifier: "text-sm font-semibold text-gray-700"
              }
            }}
          />

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Image
                  src="/assets/icons/menu.svg"
                  alt="menu"
                  width={24}
                  height={24}
                  className="cursor-pointer"
                />
              </button>
            </SheetTrigger>
            
            <SheetContent className="sheet-content sm:w-80 bg-white border-l border-gray-200">
              <div className="flex flex-col h-full">
                {/* Logo in Sheet */}
                <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-purple-gradient flex items-center justify-center">
                    <span className="text-white font-bold">I</span>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    IMAGINIFY
                  </span>
                </div>

                {/* Navigation Links */}
                <ul className="header-nav_elements flex-1 py-6">
                  {navLinks.map((link) => {
                    const isActive = link.route === location.pathname

                    return (
                      <li
                        className={`${
                          isActive ? 'bg-purple-gradient text-white shadow-lg' : 'text-gray-700 hover:bg-purple-50'
                        } rounded-xl transition-all duration-200 hover:scale-[1.02]`}
                        key={link.route}
                      >
                        <Link
                          className="sidebar-link cursor-pointer flex items-center gap-4 p-4 rounded-xl transition-all"
                          to={link.route}
                        >
                          <div className={`p-2 rounded-lg ${
                            isActive ? 'bg-white/20' : 'bg-gray-100'
                          } transition-all`}>
                            <Image
                              src={link.icon}
                              alt={link.label}
                              width={20}
                              height={20}
                              className={`${
                                isActive ? 'brightness-0 invert' : 'opacity-70'
                              } transition-all`}
                            />
                          </div>
                          <span className="font-semibold">{link.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>

                {/* User Profile at Bottom */}
                <div className="border-t border-gray-100 pt-4">
                  <UserButton 
                    afterSignOutUrl="/" 
                    showName
                    appearance={{
                      elements: {
                        userButtonBox: "flex gap-3 items-center p-3 rounded-xl hover:bg-gray-50 transition-colors w-full",
                        userButtonOuterIdentifier: "text-base font-semibold text-gray-700",
                        userButtonAvatarBox: "w-10 h-10"
                      }
                    }}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </SignedIn>

        <SignedOut>
          <Button asChild className="bg-purple-gradient text-white px-6 py-2 rounded-full hover:scale-105 transition-transform">
            <Link to="/sign-in">Login</Link>
          </Button>
        </SignedOut>
      </nav>
    </header>
  )
}

export default MobileNav
