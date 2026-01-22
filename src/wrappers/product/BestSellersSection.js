import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import SectionTitle from "../../components/section-title/SectionTitle";
import ProductGridSingleTwo from "../../components/product/ProductGridSingleTwo";

const BestSellersSection = () => {
  const { products } = useSelector((state) => state.product);
  const currency = useSelector((state) => state.currency);
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { compareItems } = useSelector((state) => state.compare);
  const [bestSellers, setBestSellers] = useState([]);

  const apiBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
    || process.env.REACT_APP_API_URL
    || '';

  useEffect(() => {
    let cancelled = false;
    async function fetchBest() {
      // Try backend endpoint if available; otherwise fallback to first 15 products
      if (!apiBase) {
        setBestSellers(Array.isArray(products) ? products.slice(0, 15) : []);
        return;
      }
      try {
        const r = await fetch(`${apiBase}/api/product/best-sellers?limit=15&days=7`);
        if (!r.ok) throw new Error(String(r.status));
        const arr = await r.json();
        const list = Array.isArray(arr) ? arr : (arr.items || arr.rows || arr.data || []);
        if (!cancelled) setBestSellers(list.slice(0, 15));
      } catch (_) {
        if (!cancelled) setBestSellers(Array.isArray(products) ? products.slice(0, 15) : []);
      }
    }
    fetchBest();
    return () => { cancelled = true; };
  }, [apiBase, products]);

  const items = useMemo(() => (Array.isArray(bestSellers) ? bestSellers.slice(0, 15) : []), [bestSellers]);

  return (
    <div className="product-area pb-100">
      <div className="container">
        <SectionTitle titleText="BEST SELLERS OF THE WEEK" positionClass="text-center" />
        <div className="product-grid-5">
          {items && items.length > 0 ? (
            items.map((product) => (
              <div key={product.ProductId || product.id || product._id}>
                <ProductGridSingleTwo
                  product={product}
                  currency={currency}
                  cartItem={cartItems.find((c) => (c.ProductId || c.id) === (product.ProductId || product.id || product._id))}
                  wishlistItem={wishlistItems.find((w) => (w.ProductId || w.id) === (product.ProductId || product.id || product._id))}
                  compareItem={compareItems.find((cm) => (cm.ProductId || cm.id) === (product.ProductId || product.id || product._id))}
                  spaceBottomClass="mb-25"
                />
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <p>No products found.</p>
            </div>
          )}
        </div>
        <div className="view-more text-center mt-20 toggle-btn6 col-12">
          <a
            className="view-more-products-btn"
            href={process.env.PUBLIC_URL + "/shop-grid-standard"}
            style={{
              display: 'inline-block',
              background: '#111',
              color: '#fffef1',
              fontWeight: 700,
              fontSize: '1.35rem',
              padding: '22px 60px',
              borderRadius: '32px',
              border: 'none',
              letterSpacing: '1px',
              margin: '18px 0 0 0',
              boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
              transition: 'transform 0.18s cubic-bezier(.23,1.02,.64,.97), background 0.18s',
              textDecoration: 'none'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            VIEW MORE PRODUCTS
          </a>
        </div>
      </div>
    </div>
  );
};

export default BestSellersSection;

