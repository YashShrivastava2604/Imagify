import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import Sidebar from '@/components/shared/Sidebar'
import MobileNav from '@/components/shared/MobileNav'

const RootLayout = ({ children }) => {
  return (
    <>
      <SignedIn>
        <main className="root">
          <Sidebar />
          <MobileNav />
          <div className="root-container">
            <div className="wrapper">
              {children}
            </div>
          </div>
        </main>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

export default RootLayout
