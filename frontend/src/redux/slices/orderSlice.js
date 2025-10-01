// Filename: orderSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
// ✅ FIX: Import the logout action from your auth slice
import { logout } from "./authSlice"; 

// Async Thunk to fetch a single order's details
export const fetchOrderDetails = createAsyncThunk(
  "orders/fetchOrderDetails",
  async (orderId, { rejectWithValue }) => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      return rejectWithValue("No authentication token found. Please login again.");
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      // ✅ FIX: Return a string message for rejected status
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async Thunk to fetch all user orders
export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async (_, { rejectWithValue, dispatch }) => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      // ✅ FIX: If no token, dispatch logout and reject
      dispatch(logout()); 
      return rejectWithValue("No authentication token found. Please login again.");
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      // ✅ FIX: Check for 401 and dispatch logout
      if (error.response && error.response.status === 401) {
        dispatch(logout());
        return rejectWithValue("Session expired. Please log in again.");
      }
      // ✅ FIX: Return a string message
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    orders: [],
    orderDetails: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch user orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload || [];
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        // ✅ FIX: Now the payload will always be a string
        state.error = action.payload || "Failed to fetch orders"; 
      })
      // fetch order details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetails = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch order details";
      });
  },
});

export default orderSlice.reducer;