
import { Fragment } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { getProducts } from "../../helpers/product";
import ProductGridSingleTwo from "../../components/product/ProductGridSingleTwo";

const ProductGridTwo = ({
  spaceBottomClass,
  colorClass,
  titlePriceClass,
  category,
  type,
  limit
}) => {
  const { products } = useSelector((state) => state.product);
  const currency = useSelector((state) => state.currency);
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { compareItems } = useSelector((state) => state.compare);
  
  console.log('ProductGridTwo - All products from Redux:', products);
  console.log('ProductGridTwo - Category:', category, 'Type:', type, 'Limit:', limit);
  
  // Show all products (not filtered by type) and limit to first 6 for homepage
  const displayProducts = products ? products.slice(0, limit || products.length) : [];
  console.log('ProductGridTwo - Products to display:', displayProducts);
  
  return (
    <Fragment>
      {displayProducts && displayProducts.length > 0 ? (
        displayProducts.map((product) => {
          return (
            <div className="col-xl-3 col-md-6 col-lg-4 col-sm-6" key={product.ProductId}>
              <ProductGridSingleTwo
                spaceBottomClass={spaceBottomClass}
                colorClass={colorClass}
                product={product}
                currency={currency}
                cartItem={
                  cartItems.find((cartItem) => cartItem.ProductId === product.ProductId)
                }
                wishlistItem={
                  wishlistItems.find(
                    (wishlistItem) => wishlistItem.ProductId === product.ProductId
                  )
                }
                compareItem={
                  compareItems.find(
                    (compareItem) => compareItem.ProductId === product.ProductId
                  )
                }
                titlePriceClass={titlePriceClass}
              />
            </div>
          );
        })
      ) : (
        <div className="col-12 text-center">
          <p>No products found. Total products in store: {products ? products.length : 0}</p>
        </div>
      )}
    </Fragment>
  );
};

ProductGridTwo.propTypes = {
  sliderClassName: PropTypes.string,
  spaceBottomClass: PropTypes.string,
  colorClass: PropTypes.string,
  titlePriceClass: PropTypes.string,
  category: PropTypes.string,
  type: PropTypes.string,
  limit: PropTypes.number
};

export default ProductGridTwo;


