import { Fragment, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
/* import SEO from "../../components/seo"; */
import { getDiscountPrice } from "../../helpers/product";
import Layout from "../../layouts/Layout";
import Breadcrumb from "../../wrappers/breadcrumb/Breadcrumb";
import { addToCart, decreaseQuantity, deleteFromCart, deleteAllFromCart } from "../../store/slices/cart-slice";
import { cartItemStock } from "../../helpers/product";
import { resolveImageSource } from "../../utils/image";

const Cart = () => {
  let cartTotalPrice = 0;

  const [quantityCount] = useState(1);
  const dispatch = useDispatch();
  let { pathname } = useLocation();
  
  const currency = useSelector((state) => state.currency);
  const { cartItems } = useSelector((state) => state.cart);

  return (
    <Fragment>
     {/*  <SEO
        titleTemplate="Cart"
        description="Cart page of flone react minimalist eCommerce template."
      /> */}

      <Layout headerTop="visible">
        {/* breadcrumb */}
        <Breadcrumb 
          pages={[
            {label: "Home", path: "/" },
            {label: "Cart", path: pathname }
          ]} 
        />
        <div className="cart-main-area pt-90 pb-100">
          <div className="container">
            {cartItems && cartItems.length >= 1 ? (
              <Fragment>
                <h3 className="cart-page-title" style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.2 }}>Your cart items</h3>
                <div className="row">
                  <div className="col-12">
                    <div className="table-content table-responsive cart-table-content" style={{ fontSize: '1.3rem' }}>
                      <table style={{ width: '100%', borderSpacing: 0 }}>
                        <thead>
                          <tr style={{ fontSize: '1rem' }}>
                            <th>Image</th>
                            <th>Product</th>
                            <th>Unit Price</th>
                            <th>Qty</th>
                            <th>Subtotal</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartItems.map((cartItem, key) => {
                            const discountedPrice = getDiscountPrice(
                              cartItem.price,
                              cartItem.discount
                            );
                            const finalProductPrice = (
                              cartItem.price * currency.currencyRate
                            ).toFixed(2);
                            const finalDiscountedPrice = (
                              discountedPrice * currency.currencyRate
                            ).toFixed(2);

                            discountedPrice != null
                              ? (cartTotalPrice +=
                                  finalDiscountedPrice * cartItem.quantity)
                              : (cartTotalPrice +=
                                  finalProductPrice * cartItem.quantity);
                            return (
                              <tr key={key} style={{ height: 160 }}>
                                <td className="product-thumbnail" style={{ padding: '26px' }}>
                                  <Link
                                    to={
                                      "/product/" +
                                      cartItem.ProductId
                                    }
                                  >
                                    <img
                                      className="img-fluid"
                                      src={resolveImageSource(cartItem.img, cartItem.imageUrl)}
                                      alt=""
                                      style={{ width: 140, height: 140, objectFit: 'contain' }}
                                    />
                                  </Link>
                                </td>

                                <td className="product-name" style={{ fontSize: '1.3rem', padding: '26px' }}>
                                  <Link
                                    to={
                                      "/product/" +
                                      cartItem.ProductId
                                    }
                                  >
                                    {cartItem.name}
                                  </Link>
                                  {cartItem.description || cartItem.desc ? (
                                    <div className="cart-item-description" style={{ fontSize: '0.9rem', color: '#666', marginTop: '8px', maxWidth: '300px' }}>
                                      {cartItem.description || cartItem.desc}
                                    </div>
                                  ) : (
                                    ""
                                  )}
                                  {cartItem.selectedProductSize ? (
                                    <div className="cart-item-variation">
                                      <span style={{ fontWeight: 700 }}>Size: {cartItem.selectedProductSize}</span>
                                    </div>
                                  ) : (
                                    ""
                                  )}
                                </td>

                                <td className="product-price-cart" style={{ padding: '26px' }}>
                                  {discountedPrice !== null ? (
                                    <Fragment>
                                      <span className="amount old">
                                        {currency.currencySymbol +
                                          finalProductPrice}
                                      </span>
                                      <span className="amount">
                                        {currency.currencySymbol +
                                          finalDiscountedPrice}
                                      </span>
                                    </Fragment>
                                  ) : (
                                    <span className="amount">
                                      {currency.currencySymbol +
                                        finalProductPrice}
                                    </span>
                                  )}
                                </td>

                                <td className="product-quantity">
                                  <div className="cart-plus-minus" style={{ transform: 'scale(1.6)' }}>
                                    <button
                                      className="dec qtybutton"
                                      onClick={() =>
                                        dispatch(decreaseQuantity(cartItem))
                                      }
                                    >
                                      -
                                    </button>
                                    <input
                                      className="cart-plus-minus-box"
                                      type="text"
                                      value={cartItem.quantity}
                                      readOnly
                                      style={{ width: 64, height: 46, fontSize: '1.1rem' }}
                                    />
                                    <button
                                      className="inc qtybutton"
                                      onClick={() =>
                                        dispatch(addToCart({
                                          ...cartItem,
                                          quantity: quantityCount
                                        }))
                                      }
                                      disabled={
                                        cartItem !== undefined &&
                                        cartItem.quantity &&
                                        cartItem.quantity >=
                                          cartItemStock(
                                            cartItem,
                                            cartItem.selectedProductColor,
                                            cartItem.selectedProductSize
                                          )
                                      }
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                                <td className="product-subtotal" style={{ padding: '26px' }}>
                                  {discountedPrice !== null
                                    ? currency.currencySymbol +
                                      (
                                        finalDiscountedPrice * cartItem.quantity
                                      ).toFixed(2)
                                    : currency.currencySymbol +
                                      (
                                        finalProductPrice * cartItem.quantity
                                      ).toFixed(2)}
                                </td>

                                <td className="product-remove" style={{ padding: '26px' }}>
                                  <button
                                    onClick={() =>
                                      dispatch(deleteFromCart(cartItem.cartItemId))
                                    }
                                    style={{ transform: 'scale(1.4)' }}
                                  >
                                    <i className="fa fa-times"></i>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12">
                    <div className="cart-shiping-update-wrapper">
                      <div className="cart-shiping-update">
                        <Link
                          to={"/shop-grid-standard"}
                          style={{
                            display: 'inline-block',
                            fontSize: '1.4rem',
                            fontWeight: 800,
                            padding: '14px 26px',
                            borderRadius: 12,
                            background: '#350008',
                            color: '#fffef1'
                          }}
                        >
                          Continue Shopping
                        </Link>
                      </div>
                      <div className="cart-clear">
                        <button 
                          onClick={() => dispatch(deleteAllFromCart())}
                          style={{
                            fontSize: '1.4rem',
                            fontWeight: 800,
                            padding: '14px 26px',
                            borderRadius: 12,
                            background: '#350008',
                            color: '#fffef1',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Clear Shopping Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">

                  <div className="col-lg-4 col-md-12">
                    <div className="grand-totall">
                      <div className="title-wrap">
                        <h4 className="cart-bottom-title section-bg-gary-cart">
                          Cart Total
                        </h4>
                      </div>
                      <h5>
                        Total products{" "}
                        <span>
                          {currency.currencySymbol + cartTotalPrice.toFixed(2)}
                        </span>
                      </h5>

                      <h4 className="grand-totall-title">
                        Grand Total{" "}
                        <span>
                          {currency.currencySymbol + cartTotalPrice.toFixed(2)}
                        </span>
                      </h4>
                      <Link to={"/checkout"}>
                        Proceed to Checkout
                      </Link>
                    </div>
                  </div>
                </div>
              </Fragment>
            ) : (
              <div className="row">
                <div className="col-lg-12">
                  <div className="item-empty-area text-center">
                    <div className="item-empty-area__icon mb-30">
                      <i className="pe-7s-cart"></i>
                    </div>
                    <div className="item-empty-area__text">
                      No items found in cart <br />{" "}
                      <Link to={"/shop-grid-standard"}>
                        Shop Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </Fragment>
  );
};

export default Cart;


