import {Suspense, lazy} from "react";
import ScrollToTop from "./helpers/scroll-top";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Notification from "./components/common/Notification";
import './App.css';
import './theme/custom-colors.css';
import CartSyncManager from "./components/cart/CartSyncManager";

const HomeNew = lazy(() => import("./NewPages/Home/Home"));
const LoginPage = lazy(() => import('./NewPages/auth/Login'));
const SignupPage = lazy(() => import('./NewPages/auth/Signup'));
const WishlistNew = lazy(() => import("./NewPages/other/Wishlist"));
const CartNew = lazy(() => import("./NewPages/other/Cart"));
const AllProducts = lazy(() => import("./NewPages/other/AllProducts"));
const ProductDetailsNew = lazy(() => import("./NewPages/other/ProductDetails"));
const AboutUs = lazy(() => import("./NewPages/other/AboutUs"));
const ContactUs = lazy(() => import("./NewPages/other/ContactUs"));
const TradeCustomerForm = lazy(() => import("./NewPages/other/TradeCustomerForm"));
const Checkout = lazy(() => import("./NewPages/other/Checkout"));
const OrderStatus = lazy(() => import("./NewPages/other/OrderStatus"));
const MyOrders = lazy(() => import("./NewPages/other/MyOrders"));
const AdminOrders = lazy(() => import("./NewPages/other/AdminOrders"));
const AdminProducts = lazy(() => import("./NewPages/other/AdminProducts"));
const AdminSlider = lazy(() => import("./NewPages/other/AdminSlider"));

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartSyncManager />
           <ScrollToTop>
           <Suspense
          fallback={
            <div className="flone-preloader-wrapper">
              <div className="flone-preloader">
                <span></span>
                <span></span>
              </div>
            </div>
          }
        >
           <Routes>
           <Route exact  path="/"  element={<HomeNew />} />
           <Route path="/Home"  element={<HomeNew />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/trade-customer" element={<TradeCustomerForm />} />
           <Route path="/Wishlist"  element={<WishlistNew />} />
           <Route path="/Cart"  element={<CartNew />} />
           <Route path="/shop-grid-standard"  element={<AllProducts />} />
           <Route path="/checkout" element={<Checkout />} />
           <Route path="/my-orders" element={<MyOrders />} />
           <Route path="/order-status" element={<OrderStatus />} />
           <Route path="/admin/orders" element={<AdminOrders />} />
           <Route path="/admin/products" element={<AdminProducts />} />
           <Route path="/admin/slider" element={<AdminSlider />} />
           <Route path="/product/:productId" element={<ProductDetailsNew />} />
           </Routes>
           </Suspense>
           </ScrollToTop>
      <Notification />
    </AuthProvider>
    </Router>
  );
  
}

export default App;

