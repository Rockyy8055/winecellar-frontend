import { v4 as uuidv4 } from 'uuid';
import cogoToast from 'cogo-toast';
import { createSlice } from '@reduxjs/toolkit';
import { setProducts } from './product-slice';

const findCatalogProduct = (catalog, productId) => {
    const target = String(productId);
    return catalog.find((p) => String(p?.ProductId ?? p?.id ?? '') === target);
};

const mergeCartItemWithCatalog = (item, product) => {
    if (!product) return null;
    const normalizedId = product.ProductId ?? product.id ?? item.ProductId;
    return {
        ...item,
        ProductId: normalizedId,
        name: product.name ?? item.name,
        price: product.price ?? item.price,
        img: product.img || product.imageUrl || product.image || item.img,
        imageUrl: product.imageUrl || product.img || product.image || item.imageUrl,
        description: product.description ?? product.desc ?? item.description,
        desc: product.desc ?? product.description ?? item.desc,
        stock: product.stock ?? item.stock,
        category: product.category ?? item.category,
        subCategory: product.subCategory ?? item.subCategory
    };
};

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        cartItems: []
    },
    reducers: {
        addToCart(state, action) {
            const product = action.payload;
            if(!product.variation){
                // Treat different sizes as unique items
                const cartItem = state.cartItems.find(item => 
                    item.ProductId === product.ProductId && 
                    (item.selectedProductSize || null) === (product.selectedProductSize || null)
                );
                if(!cartItem){
                    state.cartItems.push({
                        ...product,
                        ProductId: product.ProductId || product.id,
                        imageUrl: product.imageUrl || product.img || product.image,
                        quantity: product.quantity ? product.quantity : 1,
                        cartItemId: product.cartItemId || uuidv4()
                    });
                } else {
                    state.cartItems = state.cartItems.map(item => {
                        if(item.cartItemId === cartItem.cartItemId){
                            return {
                                ...item,
                                ProductId: product.ProductId || product.id || item.ProductId,
                                imageUrl: product.imageUrl || product.img || product.image || item.imageUrl,
                                quantity: product.quantity ? item.quantity + product.quantity : item.quantity + 1
                            }
                        }
                        return item;
                    })
                }

            } else {
                const cartItem = state.cartItems.find(
                    item =>
                        item.ProductId === product.ProductId &&
                        product.selectedProductColor &&
                        product.selectedProductColor === item.selectedProductColor &&
                        product.selectedProductSize &&
                        product.selectedProductSize === item.selectedProductSize &&
                        (product.cartItemId ? product.cartItemId === item.cartItemId : true)
                );
                if(!cartItem){
                    state.cartItems.push({
                        ...product,
                        ProductId: product.ProductId || product.id,
                        imageUrl: product.imageUrl || product.img || product.image,
                        quantity: product.quantity ? product.quantity : 1,
                        cartItemId: product.cartItemId || uuidv4()
                    });
                } else if (cartItem !== undefined && (cartItem.selectedProductColor !== product.selectedProductColor || cartItem.selectedProductSize !== product.selectedProductSize)) {
                    state.cartItems = [
                        ...state.cartItems,
                        {
                            ...product,
                            ProductId: product.ProductId || product.id,
                            imageUrl: product.imageUrl || product.img || product.image,
                            quantity: product.quantity ? product.quantity : 1,
                            cartItemId: product.cartItemId || uuidv4()
                        }
                    ]
                } else {
                    state.cartItems = state.cartItems.map(item => {
                        if(item.cartItemId === cartItem.cartItemId){
                            return {
                                ...item,
                                ProductId: product.ProductId || product.id || item.ProductId,
                                imageUrl: product.imageUrl || product.img || product.image || item.imageUrl,
                                quantity: product.quantity ? item.quantity + product.quantity : item.quantity + 1,
                                selectedProductColor: product.selectedProductColor,
                                selectedProductSize: product.selectedProductSize
                            }
                        }
                        return item;
                    });
                }
            }

            cogoToast.success("Added To Cart", {position: "bottom-left"});
        },
        deleteFromCart(state, action) {
            state.cartItems = state.cartItems.filter(item => item.cartItemId !== action.payload);
            cogoToast.error("Removed From Cart", {position: "bottom-left"});
        },
        decreaseQuantity(state, action){
            const product = action.payload;
            if (product.quantity === 1) {
                state.cartItems = state.cartItems.filter(item => item.cartItemId !== product.cartItemId);
                cogoToast.error("Removed From Cart", {position: "bottom-left"});
            } else {
                state.cartItems = state.cartItems.map(item =>
                    item.cartItemId === product.cartItemId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
                cogoToast.warn("Item Decremented From Cart", {position: "bottom-left"});
            }
        },
        deleteAllFromCart(state){
            state.cartItems = []
        }
    },
    extraReducers: (builder) => {
        builder.addCase(setProducts, (state, action) => {
            const catalog = Array.isArray(action.payload) ? action.payload : [];
            state.cartItems = state.cartItems
                .map((item) => mergeCartItemWithCatalog(item, findCatalogProduct(catalog, item.ProductId)))
                .filter(Boolean);
        });
    }
});

export const { addToCart, deleteFromCart, decreaseQuantity, deleteAllFromCart } = cartSlice.actions;
export default cartSlice.reducer;

