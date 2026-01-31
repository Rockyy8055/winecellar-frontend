import { v4 as uuidv4 } from 'uuid';
import cogoToast from 'cogo-toast';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { setProducts } from './product-slice';
import {
    fetchCart as fetchCartApi,
    persistCart as persistCartApi,
    clearRemoteCart as clearRemoteCartApi
} from '../../Services/cart-api';

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const normalizeCartItem = (item = {}) => {
    const productId = item.ProductId ?? item.productId ?? item.id ?? item?.product?.id;
    if (!productId) return null;

    const resolvedQuantity = Math.max(1, toNumber(item.quantity ?? item.qty ?? item.count ?? 1, 1));
    const selectedProductSize = item.selectedProductSize ?? item.size ?? item.variant?.size ?? null;
    const selectedProductColor = item.selectedProductColor ?? item.color ?? item.variant?.color ?? null;

    return {
        ...item,
        ProductId: productId,
        quantity: resolvedQuantity,
        selectedProductSize,
        selectedProductColor,
        cartItemId: item.cartItemId ?? uuidv4()
    };
};

const normalizeCartCollection = (items = []) =>
    items
        .map(normalizeCartItem)
        .filter(Boolean);

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

export const loadCart = createAsyncThunk(
    'cart/loadCart',
    async (options = {}, { rejectWithValue }) => {
        try {
            const items = await fetchCartApi();
            return {
                items,
                preserveLocalOnEmpty: Boolean(options?.preserveLocalOnEmpty)
            };
        } catch (error) {
            return rejectWithValue(error?.message || 'Unable to load cart');
        }
    }
);

export const pushCart = createAsyncThunk(
    'cart/pushCart',
    async (_, { getState, rejectWithValue }) => {
        try {
            const items = getState().cart.cartItems;
            const payload = await persistCartApi(items);
            return payload;
        } catch (error) {
            return rejectWithValue(error?.message || 'Unable to sync cart');
        }
    }
);

export const clearRemoteCart = createAsyncThunk(
    'cart/clearRemoteCart',
    async (_, { rejectWithValue }) => {
        try {
            const payload = await clearRemoteCartApi();
            return payload;
        } catch (error) {
            return rejectWithValue(error?.message || 'Unable to clear remote cart');
        }
    }
);

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        cartItems: [],
        status: 'idle',
        error: null
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
            state.cartItems = [];
        },
        setCartItems(state, action){
            state.cartItems = normalizeCartCollection(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(setProducts, (state, action) => {
            const catalog = Array.isArray(action.payload) ? action.payload : [];
            state.cartItems = state.cartItems
                .map((item) => mergeCartItemWithCatalog(item, findCatalogProduct(catalog, item.ProductId)))
                .filter(Boolean);
        })
            .addCase(loadCart.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loadCart.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const payloadItems = action.payload?.items;
                const preserveLocalOnEmpty = Boolean(action.payload?.preserveLocalOnEmpty);
                const normalized = normalizeCartCollection(Array.isArray(payloadItems) ? payloadItems : []);

                if (preserveLocalOnEmpty && normalized.length === 0 && state.cartItems.length > 0) {
                    return;
                }

                state.cartItems = normalized;
            })
            .addCase(loadCart.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error?.message || 'Failed to load cart';
            })
            .addCase(pushCart.fulfilled, (state, action) => {
                if (Array.isArray(action.payload) && action.payload.length) {
                    state.cartItems = normalizeCartCollection(action.payload);
                }
            })
            .addCase(clearRemoteCart.fulfilled, (state) => {
                state.cartItems = [];
            });
    }
});

export const { addToCart, deleteFromCart, decreaseQuantity, deleteAllFromCart, setCartItems } = cartSlice.actions;
export default cartSlice.reducer;
