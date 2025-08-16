import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from '../../store/slices/cart-slice';
import { addToWishlist, deleteFromWishlist } from '../../store/slices/wishlist-slice';

const ProductGridSingleTwo = ({ product }) => {
  const [hovered, setHovered] = useState(false);
  const [showQty, setShowQty] = useState(false);
  const [qty, setQty] = useState(1);
  const [showStockMsg, setShowStockMsg] = useState(false);
  const [showWishlistMsg, setShowWishlistMsg] = useState(false);
  const [heartActive, setHeartActive] = useState(false);
  // size selection based on category (Wine vs Spirits)
  const normalizedCategories = useMemo(() => {
    const raw = product?.category;
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return list.map((c) => String(c).toUpperCase());
  }, [product]);

  const isWineCategory = useMemo(() => {
    // Treat any category or subcategory containing 'WINE' as wine
    const sub = String(product?.subCategory || "").toUpperCase();
    return (
      normalizedCategories.some((c) => c.includes("WINE")) || sub.includes("WINE")
    );
  }, [normalizedCategories, product]);

  const displaySizes = useMemo(() => [
    "1.5LTR", "1LTR", "75CL", "70CL", "35CL", "20CL", "10CL", "5CL"
  ], []);

  // Latest requirement: For wine, only 70CL is selectable; for all other drinks, all sizes are selectable
  const allowedSizes = useMemo(() => (isWineCategory ? ["70CL"] : displaySizes), [isWineCategory, displaySizes]);
  const sizeOptions = displaySizes;

  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]);
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems || []);
  const isWishlisted = wishlistItems.some(item => item.ProductId === product.ProductId);

  const handleAddToCart = () => {
    setShowQty(true);
  };

  const handleQtyChange = (delta) => {
    let newQty = qty + delta;
    if (newQty < 1) newQty = 1;
    if (newQty > product.stock) {
      newQty = product.stock;
      setShowStockMsg(true);
      setTimeout(() => setShowStockMsg(false), 1800);
    } else {
      setShowStockMsg(false);
    }
    setQty(newQty);
  };

  const handleConfirmAdd = () => {
    if (typeof product.stock === 'number' && qty > product.stock) {
      setShowStockMsg(true);
      return;
    }
    if (qty > product.stock) {
      setShowStockMsg(true);
      setTimeout(() => setShowStockMsg(false), 1800);
      return;
    }
    dispatch(addToCart({ ...product, quantity: qty, selectedProductSize: selectedSize }));
    setShowQty(false);
    setQty(1);
    setShowStockMsg(false);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    setHeartActive(true);
    if (!isWishlisted) {
      dispatch(addToWishlist(product));
      setShowWishlistMsg(true);
      setTimeout(() => setShowWishlistMsg(false), 1500);
    } else {
      dispatch(deleteFromWishlist(product.ProductId));
    }
    setTimeout(() => setHeartActive(false), 250);
  };

  const currency = useSelector((state) => state.currency);
  return (
    <div
      className="product-card-simple"
      style={{
        position: 'relative',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgb(0, 0, 0,1)',
        padding: '36px 24px 40px 24px',
        textAlign: 'center',
        marginBottom: '30px',
        minHeight: '480px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        cursor: 'pointer',
        transition: 'box-shadow 0.3s',
        boxShadow: hovered ? '0 6px 24px rgba(0,0,0,0.13)' : '0 2px 8px rgba(0,0,0,0.06)'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowQty(false); setQty(1); setShowStockMsg(false); }}
    >
      {/* Heart Icon */}
      <div style={{
        position: 'absolute',
        top: 18,
        right: 18,
        zIndex: 2,
      }}>
        <span
          onClick={handleWishlist}
          onMouseDown={() => setHeartActive(true)}
          onMouseUp={() => setHeartActive(false)}
          style={{
            cursor: 'pointer',
            fontSize: '2.2rem',
            color: isWishlisted ? '#e63946' : '#bbb',
            transition: 'color 0.2s, transform 0.18s cubic-bezier(.23,1.02,.64,.97)',
            userSelect: 'none',
            filter: hovered ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))' : 'none',
            transform: heartActive || hovered ? 'scale(1.25)' : 'scale(1)',
          }}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isWishlisted ? '♥' : '♡'}
        </span>
      </div>
      {/* Product Image */}
      <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <img
          src={product.img && product.img.startsWith('http') ? product.img : process.env.PUBLIC_URL + product.img}
          alt={product.name}
          style={{
            width: '100%',
            maxWidth: '280px',
            height: '280px',
            objectFit: 'contain',
            borderRadius: '16px',
            marginBottom: '24px',
            background: '#f7f7f7',
            transition: 'transform 0.35s cubic-bezier(.23,1.02,.64,.97)',
            transform: hovered ? 'scale(1.12)' : 'scale(1)'
          }}
        />
      </div>
      {/* Product Name */}
      <div style={{
        fontWeight: 700,
        fontSize: '1.5rem',
        color: '#222',
        marginBottom: '12px',
        minHeight: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        lineHeight: '1.3',
      }}>
        {product.name}
      </div>
      {/* Product Price */}
      <div style={{
        fontWeight: 700,
        fontSize: '1.6rem',
        color: '#b12704',
        marginBottom: hovered ? '12px' : 0,
        transition: 'margin-bottom 0.2s',
      }}>
        {currency.currencySymbol}{product.price}
      </div>
      {/* Size selector is shown in the popup after clicking Add to Cart */}
      {/* Product Description (only on hover) */}
      {hovered && (
        <div style={{
          fontSize: '0.97rem',
          color: '#444',
          marginTop: '6px',
          minHeight: '40px',
          transition: 'opacity 0.2s',
          opacity: hovered ? 1 : 0,
        }}>
          {product.desc}
        </div>
      )}
      {/* Add to Cart Button (on hover) */}
      {hovered && !showQty && (
        <button
          onClick={handleAddToCart}
          style={{
            marginTop: '14px',
            background: '#111',
            color: '#fff',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 28px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'background 0.2s',
          }}
        >
          Add to Cart
        </button>
      )}
      {showQty && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#fffef1',
            color: '#350008',
            padding: '24px',
            width: 'min(92vw, 520px)',
            borderRadius: '18px',
            boxShadow: '0 18px 60px rgba(0,0,0,0.25)'
          }}>
            <div style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: '12px', textAlign: 'center', color: '#350008' }}>
              Please select the desired quantity and size
            </div>
            <div className="popup-size-selector" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '16px' }}>
              {sizeOptions.map((size) => {
                const enabled = allowedSizes.includes(size);
                return (
                <button
                  key={size}
                  type="button"
                  onClick={() => enabled && setSelectedSize(size)}
                  className={`size-pill ${selectedSize === size ? 'selected' : ''}`}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '22px',
                    border: `2px solid #350008`,
                    background: enabled && selectedSize === size ? '#350008' : '#fff',
                    color: enabled ? (selectedSize === size ? '#fffef1' : '#350008') : '#350008',
                    fontWeight: 800,
                    cursor: enabled ? 'pointer' : 'not-allowed',
                    opacity: enabled ? 1 : 0.45
                  }}
                >
                  {size}
                </button>
              );})}
            </div>
            <div style={{ textAlign: 'center', margin: '6px 0 8px 0', fontWeight: 800, color: '#350008' }}>Select Quantity</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <button
                onClick={() => handleQtyChange(-1)}
                style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  border: '2px solid #350008', background: '#350008', color: '#fffef1',
                  fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer'
                }}
              >
                -
              </button>
              <span style={{ minWidth: '44px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 800, color: '#350008' }}>{qty}</span>
              <button
                onClick={() => handleQtyChange(1)}
                style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  border: '2px solid #350008', background: '#350008', color: '#fffef1',
                  fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer'
                }}
              >
                +
              </button>
            </div>
            {showStockMsg && (
              <div style={{ color: '#b12704', fontSize: '0.97rem', textAlign: 'center', marginBottom: '10px', fontWeight: 700 }}>
                THAT'S ALL WE HAVE FOR NOW
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => { setShowQty(false); }}
                style={{
                  background: '#350008', color: '#fffef1', border: 'none',
                  borderRadius: '20px', padding: '8px 18px', fontWeight: 700, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAdd}
                style={{
                  background: '#350008', color: '#fffef1', border: 'none',
                  borderRadius: '20px', padding: '8px 22px', fontWeight: 800, cursor: 'pointer'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Wishlist Added Message */}
      {showWishlistMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#e63946',
          color: '#fff',
          padding: '10px 28px',
          borderRadius: '22px',
          fontWeight: 600,
          fontSize: '1.1rem',
          zIndex: 9999,
          boxShadow: '0 2px 12px rgba(0,0,0,0.13)'
        }}>
          Item added to wishlist
        </div>
      )}
    </div>
  );
};

export default ProductGridSingleTwo;

