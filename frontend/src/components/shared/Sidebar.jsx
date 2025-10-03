import { navLinks } from '@/constants'
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import Image from '@/components/ui/Image'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const Sidebar = () => {
  const location = useLocation()

  return (
    <aside className="sidebar">
      <div className="flex size-full flex-col gap-4">
        {/* Logo */}
        <Link to="/" className="sidebar-logo">
          <Image
            src="/assets/images/logo-text.svg"
            alt="Imaginify"
            width={180}
            height={28}
          />
        </Link>

        <nav className="sidebar-nav">
          <SignedIn>
            {/* Main Navigation */}
            <ul className="sidebar-nav_elements">
              {navLinks.slice(0, 6).map((link) => {
                const isActive = link.route === location.pathname

                return (
                  <li
                    key={link.route}
                    className={`sidebar-nav_element group ${
                      isActive ? 'bg-purple-gradient text-white' : 'text-gray-700 hover:bg-purple-50'
                    }`}
                  >
                    <Link className="sidebar-link" to={link.route}>
                      <Image
                        src={link.icon}
                        alt={link.label}
                        width={24}
                        height={24}
                        className={`${isActive ? 'brightness-200 invert' : 'opacity-70'} transition-all`}
                      />
                      <span className="font-semibold">{link.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Bottom Navigation */}
            <ul className="sidebar-nav_elements">
              {navLinks.slice(6).map((link) => {
                const isActive = link.route === location.pathname

                return (
                  <li
                    key={link.route}
                    className={`sidebar-nav_element group ${
                      isActive ? 'bg-purple-gradient text-white' : 'text-gray-700 hover:bg-purple-50'
                    }`}
                  >
                    <Link className="sidebar-link" to={link.route}>
                      <Image
                        src={link.icon}
                        alt={link.label}
                        width={24}
                        height={24}
                        className={`${isActive ? 'brightness-200 invert' : 'opacity-70'} transition-all`}
                      />
                      <span className="font-semibold">{link.label}</span>
                    </Link>
                  </li>
                )
              })}

              {/* User Profile */}
              <li className="flex-center cursor-pointer gap-2 p-4 mt-4 border-t border-gray-100">
                <UserButton 
                  afterSignOutUrl="/" 
                  showName 
                  appearance={{
                    elements: {
                      userButtonBox: "flex-row-reverse gap-2",
                      userButtonOuterIdentifier: "text-sm font-semibold text-gray-700"
                    }
                  }}
                />
              </li>
            </ul>
          </SignedIn>

          <SignedOut>
            <Button asChild className="button bg-purple-gradient bg-cover text-white">
              <Link to="/sign-in">Login</Link>
            </Button>
          </SignedOut>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar
