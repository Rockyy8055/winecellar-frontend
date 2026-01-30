import { Fragment, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Layout from "../../layouts/Layout";
import Breadcrumb from "../../wrappers/breadcrumb/Breadcrumb";
import { addToCart } from "../../store/slices/cart-slice";
import { resolveImageSource } from "../../utils/image";

const ProductDetails = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.product);
  const { cartItems } = useSelector((state) => state.cart);

  const product = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    return list.find((p) => String(p?.ProductId ?? p?.id ?? "") === String(productId));
  }, [products, productId]);

  const existingCartItem = useMemo(() => {
    if (!product) return null;
    return cartItems.find((item) => String(item.ProductId) === String(product.ProductId ?? product.id));
  }, [cartItems, product]);

  if (!product) {
    return (
      <Layout headerTop="visible">
        <div className="pt-90 pb-100">
          <div className="container">
            <h3>Product not found</h3>
            <Link to={"/shop-grid-standard"}>Back to products</Link>
          </div>
        </div>
      </Layout>
    );
  }

  const resolvedId = product.ProductId ?? product.id;
  const image = resolveImageSource(product.img, product.imageUrl);
  const desc = product.description || product.desc || "";

  const handleAdd = () => {
    dispatch(addToCart({
      ...product,
      ProductId: resolvedId,
      quantity: 1
    }));
  };

  return (
    <Fragment>
      <Layout headerTop="visible">
        <Breadcrumb
          pages={[
            { label: "Home", path: "/" },
            { label: "Product", path: `/product/${resolvedId}` }
          ]}
        />
        <div className="pt-90 pb-100">
          <div className="container">
            <div className="row">
              <div className="col-lg-5 col-md-6 col-12 mb-30">
                <img alt={product.name} src={image} className="img-fluid" />
              </div>
              <div className="col-lg-7 col-md-6 col-12">
                <h2 style={{ color: "#350008", fontWeight: 800 }}>{product.name}</h2>
                {desc ? <p style={{ marginTop: 12 }}>{desc}</p> : null}
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontWeight: 700 }}>Price: {product.price}</div>
                </div>
                <div style={{ marginTop: 18 }}>
                  <button
                    type="button"
                    className="default-btn"
                    onClick={handleAdd}
                    disabled={existingCartItem && existingCartItem.quantity > 0}
                    title={existingCartItem && existingCartItem.quantity > 0 ? "Already in cart" : "Add to cart"}
                  >
                    {existingCartItem && existingCartItem.quantity > 0 ? "Added" : "Add to Cart"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </Fragment>
  );
};

export default ProductDetails;
