import { useEffect, useMemo, useState } from 'react'
import HomeHero from '../components/home/HomeHero.jsx'
import HomeLearningNavigation from '../components/home/HomeLearningNavigation.jsx'
import HomeRecentSets from '../components/home/HomeRecentSets.jsx'
import HomeLibraryFeature from '../components/home/HomeLibraryFeature.jsx'
import { getSets } from '../api/sentenceSetApi.js'
import './AuthenticatedHome.css'

/**
 * 로그인 Learning Hub — Premium Modern Learning Product (visual v2).
 * IA / getSets / routes 유지. fake progress 없음.
 */
function AuthenticatedHome() {
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError(false)
      try {
        const list = await getSets()
        if (!alive) return
        setSets(Array.isArray(list) ? list : [])
      } catch (err) {
        console.error(err)
        if (!alive) return
        setSets([])
        setError(true)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const recentSets = useMemo(() => {
    return [...sets]
      .sort((a, b) => {
        const at = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
        const bt = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
        if (bt !== at) return bt - at
        const ac = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bc = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bc - ac
      })
      .slice(0, 3)
  }, [sets])

  return (
    <div className="homeHub">
      <div className="homeHubInner">
        <HomeHero />
        <HomeLearningNavigation />
        <div className="homeHubLower">
          <HomeRecentSets loading={loading} error={error} sets={recentSets} />
          <HomeLibraryFeature />
        </div>
      </div>
    </div>
  )
}

export default AuthenticatedHome
