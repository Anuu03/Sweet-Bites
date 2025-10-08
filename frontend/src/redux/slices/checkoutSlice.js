// Filename: checkoutSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Helper: Get token safely
const getToken = () => localStorage.getItem("userToken");

// ✅ Helper: API base URL from environment
const API_URL = import.meta.env.VITE_BACKEND_URL;

// ==================== ASYNC THUNKS ==================== //

// 1️⃣ Create a checkout session
export const createCheckout = createAsyncThunk(
  "checkout/createCheckout",
  async (checkoutData, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("No authentication token found. Please login again.");

    try {
      const { data } = await axios.post(`${API_URL}/api/checkout`, checkoutData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create checkout.");
    }
  }
);

// 2️⃣ Pay for a checkout
export const payCheckout = createAsyncThunk(
  "checkout/payCheckout",
  async ({ checkoutId, paymentStatus, paymentDetails }, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("No authentication token found. Please login again.");

    try {
      const { data } = await axios.put(
        `${API_URL}/api/checkout/${checkoutId}/pay`,
        { paymentStatus, paymentDetails },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Payment failed. Please try again.");
    }
  }
);

// 3️⃣ Finalize checkout (order confirmation)
export const finalizeCheckout = createAsyncThunk(
  "checkout/finalizeCheckout",
  async (checkoutId, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("No authentication token found. Please login again.");

    try {
      const { data } = await axios.post(
        `${API_URL}/api/checkout/${checkoutId}/finalize`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to finalize checkout.");
    }
  }
);

// ==================== SLICE ==================== //

const checkoutSlice = createSlice({
  name: "checkout",
  initialState: {
    checkout: null,
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    // Optional helper to clear checkout state
    clearCheckoutState: (state) => {
      state.checkout = null;
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ createCheckout
      .addCase(createCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkout = action.payload;
        state.success = true;
      })
      .addCase(createCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // ✅ payCheckout
      .addCase(payCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(payCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkout = action.payload;
        state.success = true;
      })
      .addCase(payCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // ✅ finalizeCheckout
      .addCase(finalizeCheckout.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(finalizeCheckout.fulfilled, (state, action) => {
        state.loading = false;
        state.checkout = action.payload;
        state.success = true;
      })
      .addCase(finalizeCheckout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

// ==================== EXPORTS ==================== //

export const { clearCheckoutState } = checkoutSlice.actions;
export default checkoutSlice.reducer;
