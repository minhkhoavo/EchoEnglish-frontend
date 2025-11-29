import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  PromoCode,
  PromoFilters,
  PaginationInfo,
} from '../types/promo.types';

interface PromoState {
  promos: PromoCode[];
  pagination: PaginationInfo | null;
  filters: PromoFilters;
  loading: boolean;
  error: string | null;
  selectedPromo: PromoCode | null;
}

const initialState: PromoState = {
  promos: [],
  pagination: null,
  filters: {
    search: '',
    active: '',
    minDiscount: '',
    maxDiscount: '',
    sort: 'desc',
    status: '',
    availability: '',
  },
  loading: false,
  error: null,
  selectedPromo: null,
};

const adminPromoSlice = createSlice({
  name: 'adminPromo',
  initialState,
  reducers: {
    setPromos: (state, action: PayloadAction<PromoCode[]>) => {
      state.promos = action.payload;
      state.loading = false;
      state.error = null;
    },
    setPagination: (state, action: PayloadAction<PaginationInfo>) => {
      state.pagination = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<PromoFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedPromo: (state, action: PayloadAction<PromoCode | null>) => {
      state.selectedPromo = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    addPromo: (state, action: PayloadAction<PromoCode>) => {
      state.promos.unshift(action.payload);
    },
    updatePromo: (state, action: PayloadAction<PromoCode>) => {
      const index = state.promos.findIndex((p) => p._id === action.payload._id);
      if (index !== -1) {
        state.promos[index] = action.payload;
      }
    },
    removePromo: (state, action: PayloadAction<string>) => {
      state.promos = state.promos.filter((p) => p._id !== action.payload);
    },
  },
});

export const {
  setPromos,
  setPagination,
  setFilters,
  clearFilters,
  setSelectedPromo,
  setLoading,
  setError,
  addPromo,
  updatePromo,
  removePromo,
} = adminPromoSlice.actions;

export default adminPromoSlice.reducer;
