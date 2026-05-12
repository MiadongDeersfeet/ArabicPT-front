import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import RequireAuth from './components/auth/RequireAuth.jsx'
import Layout from './components/layout/Layout.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import AuthCallback from './pages/AuthCallback.jsx'
import Library from './pages/Library.jsx'
import LibraryFolders from './pages/LibraryFolders.jsx'
import LibraryFolderDetail from './pages/LibraryFolderDetail.jsx'
import LibraryCreateSet from './pages/LibraryCreateSet.jsx'
import LibrarySetDetail from './pages/LibrarySetDetail.jsx'
import SentenceStudy from './pages/SentenceStudy.jsx'
import UiKit from './pages/UiKit.jsx'

function App() {
  return (
    <AuthProvider>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route path="/library/all" element={<Navigate to="/library" replace />} />
      <Route
        path="/library"
        element={
          <Layout>
            <RequireAuth>
              <Library />
            </RequireAuth>
          </Layout>
        }
      />
      <Route
        path="/library/folders"
        element={
          <Layout>
            <RequireAuth>
              <LibraryFolders />
            </RequireAuth>
          </Layout>
        }
      />
      <Route
        path="/library/folders/:folderId"
        element={
          <Layout>
            <RequireAuth>
              <LibraryFolderDetail />
            </RequireAuth>
          </Layout>
        }
      />
      <Route
        path="/library/sets/new"
        element={
          <Layout>
            <RequireAuth>
              <LibraryCreateSet />
            </RequireAuth>
          </Layout>
        }
      />
      <Route
        path="/library/sets/:setId"
        element={
          <Layout>
            <RequireAuth>
              <LibrarySetDetail />
            </RequireAuth>
          </Layout>
        }
      />
      <Route path="/study/sentences" element={<Navigate to="/library" replace />} />
      <Route
        path="/study/sets/:setId"
        element={
          <Layout>
            <SentenceStudy />
          </Layout>
        }
      />
      <Route
        path="/ui-kit"
        element={
          <Layout>
            <UiKit />
          </Layout>
        }
      />
    </Routes>
    </AuthProvider>
  )
}

export default App
