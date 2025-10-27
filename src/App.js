import {Suspense, lazy} from "react";
import ScrollToTop from "./helpers/scroll-top";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import ULogin from './pages/ULogin';
import Register from './pages/Register';
import Home from './pages/Home/Home';
import Cart from './pages/Single Pages/Cart'; 
import './App.css';
import './theme/custom-colors.css';
import Wishlist from './pages/Single Pages/Wishlist'; 
import ProductDetails from './pages/Single Pages/ProductDetails';
import BlankPage from './pages/BlankPage';
import Shipping from './pages/Shipping/Shipping';
import Payment from './pages/Payment/Payment';
import PricingBifurcation from './pages/Payment/PricingBifurcation';
import PaymentSuccess from './pages/Payment/PaymentSuccess';

const HomeNew = lazy(() => import("./NewPages/Home/Home"));
const LoginPage = lazy(() => import('./pages/Auth/Login'));
const SignupPage = lazy(() => import('./pages/Auth/Signup'));
const WishlistNew = lazy(() => import("./NewPages/other/Wishlist"));
const CartNew = lazy(() => import("./NewPages/other/Cart"));
const AllProducts = lazy(() => import("./NewPages/other/AllProducts"));
const AboutUs = lazy(() => import("./NewPages/other/AboutUs"));
const ContactUs = lazy(() => import("./NewPages/other/ContactUs"));
const TradeCustomerForm = lazy(() => import("./NewPages/other/TradeCustomerForm"));
const Checkout = lazy(() => import("./NewPages/other/Checkout"));
const OrderStatus = lazy(() => import("./NewPages/other/OrderStatus"));
const AdminOrders = lazy(() => import("./NewPages/other/AdminOrders"));
const AdminProducts = lazy(() => import("./NewPages/other/AdminProducts"));

function App() {
  return (
    
        <Router>
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
             <Route path="/order-status" element={<OrderStatus />} />
             <Route path="/admin/orders" element={<AdminOrders />} />
             <Route path="/admin/products" element={<AdminProducts />} />
             <Route path="/product/:productId" element={<ProductDetails />} />
             </Routes>
             </Suspense>
             </ScrollToTop>
            <Routes>
            <Route  path="/Login-old"  element={<ULogin />} />
            <Route  path="/Register-old"  element={<Register />} />
            <Route path="/Home-old"  element={<Home />} />
            <Route path="/Cart-old" element={<Cart />} />
            <Route path="/Wishlist-old" element={<Wishlist />} />
            <Route path="/product-old/:productId" element={<ProductDetails />} />
            <Route path="/BlankPage-old" element={<BlankPage />} />
            <Route path="/shipping-old" element={<Shipping />} />
            <Route path="/payment-old" element={<Payment />} />
            <Route path="/pricing-bifurcation-old" element={<PricingBifurcation />} />
             <Route path="/payment-success-old" element={<PaymentSuccess />} />
            </Routes>
            
        </Router>
    );
  
}

export default App;

