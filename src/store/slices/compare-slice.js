import cogoToast from 'cogo-toast';
import { createSlice, createAsyncThunk }from '@reduxjs/toolkit';
import { setProducts } from './product-slice';

const STORAGE_KEY = 'compareMeta';

const loadStoredCompare = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((item) => item && item.ProductId).map((item) => ({
            ProductId: item.ProductId,
        }));
    } catch (_) {
        return [];
    }
};

const persistCompare = (items) => {
    try {
        const meta = items.map(({ ProductId }) => ({ ProductId }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(meta));
    } catch (_) {
        /* ignore */
    }
};

export const rehydrateCompareWithProducts = createAsyncThunk(
    'compare/rehydrate',
    async (_, { getState }) => {
        const { product } = getState();
        const catalog = Array.isArray(product?.products) ? product.products : [];
        return loadStoredCompare()
            .map((meta) => {
                const liveProduct = catalog.find((p) => p.ProductId === meta.ProductId || p.id === meta.ProductId);
                if (!liveProduct) return null;
                return {
                    ...liveProduct,
                    ProductId: liveProduct.ProductId || liveProduct.id,
                };
            })
            .filter(Boolean);
    }
);

const compareSlice = createSlice({
    name: "compare",
    initialState: {
        compareItems: []
    },
    reducers: {
        addToCompare(state, action) {
            const payload = action.payload;
            const exists = state.compareItems.some(item => item.ProductId === payload.ProductId);
            if (!exists) {
                state.compareItems.push({ ...payload, ProductId: payload.ProductId });
                cogoToast.success("Added To compare", {position: "bottom-left"});
                persistCompare(state.compareItems);
            } else {
                cogoToast.info("Product already in compare", {position: "bottom-left"});
            }
        },
        deleteFromCompare(state, action){
            state.compareItems = state.compareItems.filter(item => item.ProductId !== action.payload);
            cogoToast.error("Removed From Compare", {position: "bottom-left"});
            persistCompare(state.compareItems);
        }
    },
    extraReducers: (builder) => {
        builder.addCase(rehydrateCompareWithProducts.fulfilled, (state, action) => {
            state.compareItems = action.payload;
            persistCompare(state.compareItems);
        });
        builder.addCase(setProducts, (state, action) => {
            const catalog = Array.isArray(action.payload) ? action.payload : [];
            state.compareItems = state.compareItems
                .map((item) => {
                    const target = catalog.find((p) => String(p?.ProductId ?? p?.id ?? '') === String(item.ProductId));
                    if (!target) return null;
                    return {
                        ...target,
                        ProductId: target.ProductId || target.id,
                        img: target.img || target.imageUrl,
                        imageUrl: target.imageUrl || target.img,
                    };
                })
                .filter(Boolean);
            persistCompare(state.compareItems);
        });
    }
});

export const { addToCompare, deleteFromCompare } = compareSlice.actions;
export { rehydrateCompareWithProducts };
export default compareSlice.reducer;


