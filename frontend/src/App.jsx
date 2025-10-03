import { Routes, Route } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import AuthLayout from './layouts/AuthLayout'
import Home from './pages/Home'
import Credits from './pages/Credits'
import Profile from './pages/Profile'
import ImageDetails from './pages/ImageDetails'
import UpdateTransformation from './pages/UpdateTransformation'
import AddTransformation from './pages/AddTransformation'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <>
      <Routes>
        {/* Auth Routes */}
        <Route path="/sign-in" element={<AuthLayout><SignInPage /></AuthLayout>} />
        <Route path="/sign-up" element={<AuthLayout><SignUpPage /></AuthLayout>} />
        
        {/* Protected Routes */}
        <Route path="/" element={<RootLayout><Home /></RootLayout>} />
        <Route path="/credits" element={<RootLayout><Credits /></RootLayout>} />
        <Route path="/profile" element={<RootLayout><Profile /></RootLayout>} />
        <Route path="/transformations/:id" element={<RootLayout><ImageDetails /></RootLayout>} />
        <Route path="/transformations/:id/update" element={<RootLayout><UpdateTransformation /></RootLayout>} />
        <Route path="/transformations/add/:type" element={<RootLayout><AddTransformation /></RootLayout>} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App
