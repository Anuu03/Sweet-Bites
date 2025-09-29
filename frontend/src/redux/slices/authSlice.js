import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Retrieve user info and token from localStorage if available
const userFromStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

// Check for an existing guest ID in localStorage or generate a new one
const initialGuestId =
  localStorage.getItem("guestId") || `guest_${new Date().getTime()}`;
localStorage.setItem("guestId", initialGuestId);

// Initial State
const initialState = {
  user: userFromStorage,
  guestId: initialGuestId,
  loading: false,
  error: null,
  success: false, 
};

// Async Thunk for user login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/login`,
        userData
      );

      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      localStorage.setItem("userToken", response.data.token);

      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Login failed" });
    }
  }
);

// Async Thunk for user registration
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
        userData
      );

      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      localStorage.setItem("userToken", response.data.token);

      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Registration failed" });
    }
  }
);

// Async Thunk for forgot password
export const forgotPasswordUser = createAsyncThunk(
  "auth/forgotPasswordUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/forgot-password`,
        userData
      );
      return response.data;
    } catch (error) {
      // IMPORTANT: Return a generic message here to prevent email enumeration.
      return rejectWithValue({ message: "If an account with that email exists, a password reset link has been sent." });
    }
  }
);

// NEW Async Thunk for resetting password
export const resetPasswordUser = createAsyncThunk(
  "auth/resetPasswordUser",
  async (resetData, { rejectWithValue }) => {
    // resetData contains { token, newPassword }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/reset-password`,
        resetData
      );
      // Backend should return a simple success message
      return response.data;
    } catch (error) {
      // The backend should return specific error messages like "token expired"
      return rejectWithValue(error.response?.data || { message: "Failed to reset password." });
    }
  }
);


// Slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Add a utility reducer to clear messages/status after a reset attempt
    clearAuthStatus: (state) => {
        state.error = null;
        state.success = false;
    },
    logout: (state) => {
      state.user = null;
      state.guestId = `guest_${new Date().getTime()}`;
      state.success = false; // reset success state on logout
      state.error = null; // clear error state on logout
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userToken");
      localStorage.setItem("guestId", state.guestId);
    },
    generateNewGuestId: (state) => {
      state.guestId = `guest_${new Date().getTime()}`;
      localStorage.setItem("guestId", state.guestId);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Registration failed";
      })

      // Forgot Password
      .addCase(forgotPasswordUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(forgotPasswordUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.success = true;
      })
      .addCase(forgotPasswordUser.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload?.message;
          state.success = false;
      })

      // Reset Password
      .addCase(resetPasswordUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(resetPasswordUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.success = true; // This success is now used to trigger the redirect in ResetPassword.jsx
      })
      .addCase(resetPasswordUser.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload?.message || "Reset failed. Please check the token.";
          state.success = false;
      });
  },
});

export const { logout, generateNewGuestId, clearAuthStatus } = authSlice.actions;
export default authSlice.reducer;
