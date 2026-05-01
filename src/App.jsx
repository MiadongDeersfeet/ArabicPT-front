import './App.css'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Home from './pages/Home.jsx'
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
