import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  Payment,
  PaymentFilters,
  PaginationInfo,
} from '../types/payment.types';

interface PaymentState {
  payments: Payment[];
  pagination: PaginationInfo | null;
  filters: PaymentFilters;
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  payments: [],
  pagination: null,
  filters: {
    status: '',
    type: '',
    gateway: '',
    email: '',
    fromDate: '',
    toDate: '',
  },
  loading: false,
  error: null,
};

const adminPaymentSlice = createSlice({
  name: 'adminPayment',
  initialState,
  reducers: {
    setPayments: (state, action: PayloadAction<Payment[]>) => {
      state.payments = action.payload;
      state.loading = false;
      state.error = null;
    },
    setPagination: (state, action: PayloadAction<PaginationInfo>) => {
      state.pagination = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<PaymentFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setPayments,
  setPagination,
  setFilters,
  clearFilters,
  setLoading,
  setError,
} = adminPaymentSlice.actions;

export default adminPaymentSlice.reducer;
