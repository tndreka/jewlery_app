import { useState, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import CartDrawer from './components/cart/CartDrawer'
import LoadingScreen from './components/ui/LoadingScreen'
import Home from './pages/Home'
import Shop from './pages/Shop'
import CategoryPage from './pages/CategoryPage'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'

export default function App() {
  const [loading, setLoading] = useState(true)
  const handleFinish = useCallback(() => setLoading(false), [])

  return (
    <>
      {loading && <LoadingScreen onFinish={handleFinish} />}
      <Header />
      <CartDrawer />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:orderNumber" element={<OrderConfirmation />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
