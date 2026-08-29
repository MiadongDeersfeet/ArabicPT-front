import { useAuth } from '../context/AuthContext'
import AuthenticatedHome from './AuthenticatedHome.jsx'
import PublicHome from './PublicHome.jsx'

/**
 * `/` auth switch — Landing / Learning Hub 책임 분리.
 */
function Home() {
  const { auth } = useAuth()
  return auth ? <AuthenticatedHome /> : <PublicHome />
}

export default Home
