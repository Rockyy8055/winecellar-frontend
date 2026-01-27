import cogoToast from 'cogo-toast';
import { createSlice, createAsyncThunk }from '@reduxjs/toolkit';
import { setProducts } from './product-slice';

const STORAGE_KEY = 'wishlistMeta';

const loadStoredWishlist = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter((item) => item && item.ProductId)
            .map((item) => ({
                ProductId: item.ProductId,
                cartItemId: item.cartItemId || item.ProductId,
            }));
    } catch (_) {
        return [];
    }
};

const persistWishlist = (items) => {
    try {
        const meta = items.map(({ ProductId, cartItemId }) => ({ ProductId, cartItemId }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
    } catch (_) {
        /* ignore */
    }
};

export const rehydrateWishlistWithProducts = createAsyncThunk(
    'wishlist/rehydrate',
    async (_, { getState }) => {
        const { product } = getState();
        const catalog = Array.isArray(product?.products) ? product.products : [];
        return loadStoredWishlist()
            .map((meta) => {
                const liveProduct = catalog.find((p) => p.ProductId === meta.ProductId || p.id === meta.ProductId);
                if (!liveProduct) return null;
                return {
                    ...liveProduct,
                    ProductId: liveProduct.ProductId || liveProduct.id,
                    img: liveProduct.img || liveProduct.imageUrl,
                    imageUrl: liveProduct.imageUrl || liveProduct.img,
                    cartItemId: meta.cartItemId || liveProduct.ProductId || liveProduct.id,
                };
            })
            .filter(Boolean);
    }
);

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState: {
        wishlistItems: []
    },
    reducers: {
        addToWishlist(state, action) {
            const payload = action.payload;
            const existingIndex = state.wishlistItems.findIndex(item => item.ProductId === payload.ProductId);
            if(existingIndex > -1){
                state.wishlistItems[existingIndex] = { ...payload, ProductId: payload.ProductId };
                cogoToast.info("Product already in wishlist", {position: "bottom-left"});
            } else {
                state.wishlistItems.push({ ...payload, ProductId: payload.ProductId });
                cogoToast.success("Added To wishlist", {position: "bottom-left"});
            }
            persistWishlist(state.wishlistItems);
        },
        deleteFromWishlist(state, action){
            state.wishlistItems = state.wishlistItems.filter(item => item.ProductId !== action.payload);
            cogoToast.error("Removed From Wishlist", {position: "bottom-left"});
            persistWishlist(state.wishlistItems);
        },
        deleteAllFromWishlist(state){
            state.wishlistItems = [];
            persistWishlist(state.wishlistItems);
        }
    },
    extraReducers: (builder) => {
        builder.addCase(rehydrateWishlistWithProducts.fulfilled, (state, action) => {
            state.wishlistItems = action.payload;
            persistWishlist(state.wishlistItems);
        });
        builder.addCase(setProducts, (state, action) => {
            const catalog = Array.isArray(action.payload) ? action.payload : [];
            state.wishlistItems = state.wishlistItems
                .map((item) => {
                    const target = catalog.find((p) => String(p?.ProductId ?? p?.id ?? '') === String(item.ProductId));
                    if (!target) return null;
                    return {
                        ...target,
                        ProductId: target.ProductId || target.id,
                        cartItemId: item.cartItemId || target.ProductId || target.id,
                    };
                })
                .filter(Boolean);
            persistWishlist(state.wishlistItems);
        });
    }
});

export const { addToWishlist, deleteFromWishlist, deleteAllFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;


