import './App.css'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Home from './pages/Home.jsx'
import Library from './pages/Library.jsx'
import LibraryFolderDetail from './pages/LibraryFolderDetail.jsx'
import LibraryCreateSet from './pages/LibraryCreateSet.jsx'
import LibrarySetDetail from './pages/LibrarySetDetail.jsx'
import SentenceStudy from './pages/SentenceStudy.jsx'
import UiKit from './pages/UiKit.jsx'

function App() {
  return (
    <Routes>
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
            <Library />
          </Layout>
        }
      />
      <Route
        path="/library/folders/:folderId"
        element={
          <Layout>
            <LibraryFolderDetail />
          </Layout>
        }
      />
      <Route
        path="/library/sets/new"
        element={
          <Layout>
            <LibraryCreateSet />
          </Layout>
        }
      />
      <Route
        path="/library/sets/:setId"
        element={
          <Layout>
            <LibrarySetDetail />
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
  )
}

export default App
