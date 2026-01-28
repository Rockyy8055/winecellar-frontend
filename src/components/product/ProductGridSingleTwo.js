import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from '../../store/slices/cart-slice';
import { addToWishlist, deleteFromWishlist } from '../../store/slices/wishlist-slice';
import { resolveProductImage } from "../../utils/image";

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="280" height="280" viewBox="0 0 280 280">' +
      '<rect width="100%" height="100%" fill="#f7f7f7"/>' +
      '<path d="M84 172l36-44 32 38 22-26 38 48H84z" fill="#d9d9d9"/>' +
      '<circle cx="114" cy="110" r="14" fill="#d9d9d9"/>' +
      '<text x="50%" y="88%" text-anchor="middle" font-family="Arial" font-size="14" fill="#777">Image unavailable</text>' +
    '</svg>'
  );

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

  const sizeStockMap = useMemo(() => {
    const raw = product?.sizeStocks || {};
    const normalized = {};
    displaySizes.forEach((size) => {
      const val = Number(raw[size]);
      normalized[size] = Number.isFinite(val) && val >= 0 ? val : 0;
    });
    return normalized;
  }, [product, displaySizes]);

  // Latest requirement: For wine, only 70CL is selectable; for all other drinks, all sizes are selectable
  const allowedSizes = useMemo(() => (isWineCategory ? ["70CL"] : displaySizes), [isWineCategory, displaySizes]);
  const sizeOptions = displaySizes;

  const inStockSizes = useMemo(() => allowedSizes.filter((size) => sizeStockMap[size] > 0), [allowedSizes, sizeStockMap]);

  const preferredSize = useMemo(() => {
    if (inStockSizes.length) return inStockSizes[0];
    if (allowedSizes.length) return allowedSizes[0];
    return sizeOptions[0];
  }, [inStockSizes, allowedSizes, sizeOptions]);

  const [selectedSize, setSelectedSize] = useState(preferredSize);
  useEffect(() => {
    setSelectedSize((prev) => {
      if (prev && allowedSizes.includes(prev) && sizeStockMap[prev] > 0) return prev;
      return preferredSize;
    });
  }, [allowedSizes, sizeStockMap, preferredSize]);

  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.wishlistItems || []);
  const isWishlisted = wishlistItems.some(item => item.ProductId === product.ProductId);
  const isQuickAddProduct = useMemo(() => {
    const name = String(product?.name || '').toUpperCase();
    return (
      name.includes('WHITE CLAW') ||
      name.includes('BUZZBALL') ||
      name.includes('BUZZ BALL') ||
      name.includes('BUZZBALLZ')
    );
  }, [product]);

  const handleAddToCart = () => {
    setShowQty(true);
  };

  const availableStock = useMemo(() => {
    if (selectedSize && Number.isFinite(Number(sizeStockMap[selectedSize]))) {
      return Number(sizeStockMap[selectedSize]);
    }
    return Number(product.stock) || 0;
  }, [selectedSize, sizeStockMap, product.stock]);

  const isOutOfStock = availableStock <= 0;

  const handleQtyChange = (delta) => {
    let newQty = qty + delta;
    if (newQty < 1) newQty = 1;
    if (availableStock > 0 && newQty > availableStock) {
      newQty = availableStock;
      setShowStockMsg(true);
      setTimeout(() => setShowStockMsg(false), 1800);
    } else {
      setShowStockMsg(false);
    }
    setQty(newQty);
  };

  const handleConfirmAdd = () => {
    if (isOutOfStock || qty > availableStock) {
      setShowStockMsg(true);
      if (availableStock > 0) {
        setQty(availableStock);
      }
      return;
    }
    dispatch(addToCart({
      ...product,
      quantity: qty,
      selectedProductSize: selectedSize,
      sizeStocks: product.sizeStocks || sizeStockMap
    }));
    setShowQty(false);
    setQty(1);
    setShowStockMsg(false);
  };

  const handleQuickConfirmAdd = () => {
    const quickLimit = Number.isFinite(Number(product.stock)) ? Number(product.stock) : availableStock;
    if (quickLimit > 0 && qty > quickLimit) {
      setShowStockMsg(true);
      setTimeout(() => setShowStockMsg(false), 1800);
      setQty(quickLimit);
      return;
    }
    dispatch(addToCart({ ...product, quantity: qty, sizeStocks: product.sizeStocks || sizeStockMap }));
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
  const primaryImage = useMemo(() => {
    const variationImg = product?.variation?.find((v) => v?.image)?.image;
    const extrasImg = product?.extras?.find((extra) => extra?.image)?.image;
    return resolveProductImage({
      ...product,
      img: variationImg || extrasImg || product?.img,
      imageUrl: product?.imageUrl || variationImg || extrasImg,
    });
  }, [product]);

  const [imgSrc, setImgSrc] = useState(primaryImage || FALLBACK_IMAGE);
  useEffect(() => {
    setImgSrc(primaryImage || FALLBACK_IMAGE);
  }, [primaryImage]);

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
        transition: 'box-shadow 0.3s'
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
          src={imgSrc}
          alt={product.name}
          onError={() => {
            setImgSrc(FALLBACK_IMAGE);
          }}
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
      {/* Quick-add for specific products (only show on hover) */}
      {isQuickAddProduct ? (
        hovered && (
          <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <button
                onClick={() => handleQtyChange(-1)}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  border: '2px solid #350008', background: '#350008', color: '#fffef1',
                  fontWeight: 900, cursor: 'pointer'
                }}
              >
                −
              </button>
              <div style={{ minWidth: '40px', textAlign: 'center', fontWeight: 800 }}>{qty}</div>
              <button
                onClick={() => handleQtyChange(1)}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  border: '2px solid #350008', background: '#350008', color: '#fffef1',
                  fontWeight: 900, cursor: 'pointer'
                }}
              >
                +
              </button>
            </div>
            <button
              onClick={handleQuickConfirmAdd}
              style={{
                background: '#111', color: '#fff', border: 'none', borderRadius: '20px',
                padding: '8px 22px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              Confirm & Add
            </button>
            {showStockMsg && (
              <div style={{ color: '#b12704', fontWeight: 700 }}>Only limited stock available</div>
            )}
          </div>
        )
      ) : (
        /* Default: show Add to Cart on hover which opens quantity/size modal */
        hovered && !showQty && (
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
        )
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
                const stockAvailable = sizeStockMap[size] || 0;
                const enabled = allowedSizes.includes(size) && stockAvailable > 0;
                const isSelected = selectedSize === size;
                const baseColor = enabled ? '#350008' : 'rgba(53,0,8,0.55)';
                const textColor = isSelected ? '#fffef1' : baseColor;
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
                    background: enabled && isSelected ? '#350008' : '#fff',
                    color: textColor,
                    fontWeight: 800,
                    cursor: enabled ? 'pointer' : 'not-allowed',
                    opacity: enabled ? 1 : 0.45
                  }}
                >
                  {size}
                  <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: enabled ? (isSelected ? '#fffef1' : '#350008') : 'rgba(53,0,8,0.55)' }}>{stockAvailable} in stock</span>
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
                disabled={isOutOfStock}
                style={{
                  background: isOutOfStock ? '#999' : '#350008',
                  color: '#fffef1', border: 'none',
                  borderRadius: '20px', padding: '8px 22px', fontWeight: 800,
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  opacity: isOutOfStock ? 0.6 : 1
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



