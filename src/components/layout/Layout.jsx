import Footer from './Footer.jsx'
import Header from './Header.jsx'
import './Layout.css'

// 공통 레이아웃: Header -> main -> Footer
function Layout({ children }) {
  return (
    <div className="layoutShell">
      <Header />
      <main className="layoutMain">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
