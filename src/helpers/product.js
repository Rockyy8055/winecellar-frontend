// get products
export const getProducts = (products, category, type, limit) => {
  const finalProducts = category
    ? products.filter(
        product => Array.isArray(product.category)
          ? product.category.includes(category)
          : product.category === category
      )
    : products;

  if (type && type === "new") {
    const newProducts = finalProducts.filter(single => single.new);
    return newProducts.slice(0, limit ? limit : newProducts.length);
  }
  if (type && type === "bestSeller") {
    return finalProducts
      .sort((a, b) => {
        return b.saleCount - a.saleCount;
      })
      .slice(0, limit ? limit : finalProducts.length);
  }
  if (type && type === "saleItems") {
    const saleItems = finalProducts.filter(
      single => single.discount && single.discount > 0
    );
    return saleItems.slice(0, limit ? limit : saleItems.length);
  }
  return finalProducts.slice(0, limit ? limit : finalProducts.length);
};

// get product discount price
// Discounts are disabled to keep pricing consistent across the app.
export const getDiscountPrice = () => null;

// get product cart quantity
export const QUANTITY_SIZE_OPTIONS = [
  "1.5LTR",
  "1LTR",
  "75CL",
  "70CL",
  "35CL",
  "20CL",
  "10CL",
  "5CL"
];

export const getProductCartQuantity = (cartItems, product, color, size) => {
  let productInCart = cartItems.find(
    single =>
      single.ProductId === product.ProductId &&
      (single.selectedProductColor
        ? single.selectedProductColor === color
        : true) &&
      (single.selectedProductSize ? single.selectedProductSize === size : true)
  );
  if (cartItems.length >= 1 && productInCart) {
    if (product.variation) {
      return cartItems.find(
        single =>
          single.ProductId === product.ProductId &&
          single.selectedProductColor === color &&
          single.selectedProductSize === size
      ).quantity;
    } else {
      return cartItems.find(single => product.ProductId === single.ProductId).quantity;
    }
  } else {
    return 0;
  }
};

export const cartItemStock = (item, color, size) => {
  if (item.stock) {
    return item.stock;
  } else {
    return item.variation
      .filter(single => single.color === color)[0]
      .size.filter(single => single.name === size)[0].stock;
  }
};

//get products based on category
export const getSortedProducts = (products, sortType, sortValue) => {
  if (products && sortType && sortValue) {
    if (sortType === "category") {
      return products.filter(
        product => product.category.filter(single => single === sortValue)[0]
      );
    }
    if (sortType === "tag") {
      return products.filter(
        product => product.tag.filter(single => single === sortValue)[0]
      );
    }
    if (sortType === "color") {
      return products.filter(
        product =>
          product.variation &&
          product.variation.filter(single => single.color === sortValue)[0]
      );
    }
    if (sortType === "size") {
      return products.filter(
        product =>
          product.variation &&
          product.variation.filter(
            single => single.size.filter(single => single.name === sortValue)[0]
          )[0]
      );
    }
    if (sortType === "filterSort") {
      let sortProducts = [...products];
      if (sortValue === "default") {
        return sortProducts;
      }
      if (sortValue === "priceHighToLow") {
        return sortProducts.sort((a, b) => {
          return b.price - a.price;
        });
      }
      if (sortValue === "priceLowToHigh") {
        return sortProducts.sort((a, b) => {
          return a.price - b.price;
        });
      }
    }
  }
  return products;
};

// get individual element
const getIndividualItemArray = array => {
  let individualItemArray = array.filter(function(v, i, self) {
    return i === self.indexOf(v);
  });
  return individualItemArray;
};

// get individual categories
export const getIndividualCategories = products => {
  let productCategories = [];
  products &&
    products.map(product => {
      return (
        product.category &&
        product.category.map(single => {
          return productCategories.push(single);
        })
      );
    });
  const individualProductCategories = getIndividualItemArray(productCategories);
  return individualProductCategories;
};

// get individual tags
export const getIndividualTags = products => {
  let productTags = [];
  products &&
    products.map(product => {
      return (
        product.tag &&
        product.tag.map(single => {
          return productTags.push(single);
        })
      );
    });
  const individualProductTags = getIndividualItemArray(productTags);
  return individualProductTags;
};

const normalizeQuantityValue = value => {
  if (value === undefined || value === null) return "";
  return String(value)
    .toUpperCase()
    .replace(/LITRES?/g, "LTR")
    .replace(/LITERS?/g, "LTR")
    .replace(/\s+/g, "")
    .replace(/\./g, "");
};

const collectProductQuantityTokens = product => {
  const tokens = new Set();
  const pushValue = val => {
    if (val === undefined || val === null) return;
    if (Array.isArray(val)) {
      val.forEach(pushValue);
      return;
    }
    if (typeof val === "object") {
      Object.values(val).forEach(pushValue);
      return;
    }
    const normalized = normalizeQuantityValue(val);
    if (normalized) tokens.add(normalized);
  };

  if (!product || typeof product !== "object") {
    return Array.from(tokens);
  }

  const pushSizeMapKeys = (map = {}) => {
    Object.entries(map).forEach(([key, qty]) => {
      const normalizedKey = normalizeQuantityValue(key);
      const numericQty = Number(qty);
      if (normalizedKey && Number.isFinite(numericQty) && numericQty > 0) {
        tokens.add(normalizedKey);
      }
    });
  };

  pushValue(product.size);
  pushValue(product.Size);
  pushValue(product.SIZE);
  pushValue(product.volume);
  pushValue(product.quantity);
  pushValue(product.quantities);
  pushValue(product.availableSizes);
  pushValue(product.sizes);
  if (product.sizeStocks && typeof product.sizeStocks === 'object') {
    pushSizeMapKeys(product.sizeStocks);
  }

  if (Array.isArray(product.variation)) {
    product.variation.forEach(variant => {
      pushValue(variant?.size);
      pushValue(variant?.volume);
      if (Array.isArray(variant?.size)) {
        variant.size.forEach(sizeEntry => {
          pushValue(sizeEntry?.name || sizeEntry?.label || sizeEntry);
        });
      }
    });
  }

  return Array.from(tokens);
};

export const filterProductsByQuantityAndSort = (products = [], filters = {}) => {
  const { sizes = [], sort = "default" } = filters;
  const normalizedSelected = sizes.map(normalizeQuantityValue).filter(Boolean);

  let working = Array.isArray(products) ? [...products] : [];

  if (normalizedSelected.length) {
    working = working.filter(product => {
      const productTokens = collectProductQuantityTokens(product);
      const normalizedSizeStocks = product && typeof product === 'object'
        ? Object.entries(product.sizeStocks || {}).reduce((acc, [key, qty]) => {
            const normalizedKey = normalizeQuantityValue(key);
            const numericQty = Number(qty);
            if (normalizedKey && Number.isFinite(numericQty) && numericQty > 0) {
              acc[normalizedKey] = numericQty;
            }
            return acc;
          }, {})
        : {};

      return normalizedSelected.some(sizeKey => {
        if (normalizedSizeStocks[sizeKey] > 0) return true;
        return productTokens.includes(sizeKey);
      });
    });
  }

  if (sort === "priceHighToLow") {
    working.sort((a, b) => Number(b?.price || 0) - Number(a?.price || 0));
  } else if (sort === "priceLowToHigh") {
    working.sort((a, b) => Number(a?.price || 0) - Number(b?.price || 0));
  }

  return working;
};

// get individual colors
export const getIndividualColors = products => {
  let productColors = [];
  products &&
    products.map(product => {
      return (
        product.variation &&
        product.variation.map(single => {
          return productColors.push(single.color);
        })
      );
    });
  const individualProductColors = getIndividualItemArray(productColors);
  return individualProductColors;
};

// get individual sizes
export const getProductsIndividualSizes = products => {
  let productSizes = [];
  products &&
    products.map(product => {
      return (
        product.variation &&
        product.variation.map(single => {
          return single.size.map(single => {
            return productSizes.push(single.name);
          });
        })
      );
    });
  const individualProductSizes = getIndividualItemArray(productSizes);
  return individualProductSizes;
};

// get product individual sizes
export const getIndividualSizes = product => {
  let productSizes = [];
  product.variation &&
    product.variation.map(singleVariation => {
      return (
        singleVariation.size &&
        singleVariation.size.map(singleSize => {
          return productSizes.push(singleSize.name);
        })
      );
    });
  const individualSizes = getIndividualItemArray(productSizes);
  return individualSizes;
};

export const setActiveSort = e => {
  const filterButtons = document.querySelectorAll(
    ".sidebar-widget-list-left button, .sidebar-widget-tag button, .product-filter button"
  );
  filterButtons.forEach(item => {
    item.classList.remove("active");
  });
  e.currentTarget.classList.add("active");
};

export const setActiveLayout = e => {
  const gridSwitchBtn = document.querySelectorAll(".shop-tab button");
  gridSwitchBtn.forEach(item => {
    item.classList.remove("active");
  });
  e.currentTarget.classList.add("active");
};

export const toggleShopTopFilter = e => {
  const shopTopFilterWrapper = document.querySelector(
    "#product-filter-wrapper"
  );
  shopTopFilterWrapper.classList.toggle("active");
  if (shopTopFilterWrapper.style.height) {
    shopTopFilterWrapper.style.height = null;
  } else {
    shopTopFilterWrapper.style.height =
      shopTopFilterWrapper.scrollHeight + "px";
  }
  e.currentTarget.classList.toggle("active");
};


