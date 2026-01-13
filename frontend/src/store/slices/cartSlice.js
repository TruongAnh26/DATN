import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import cartService from '../../services/cartService'

const initialState = {
  cart: null,
  items: [],
  totalItems: 0,
  subtotal: 0,
  isLoading: false,
  isError: false,
  message: '',
}

// Get cart
export const getCart = createAsyncThunk(
  'cart/getCart',
  async (_, thunkAPI) => {
    try {
      return await cartService.getCart()
    } catch (error) {
      const message = error.response?.data?.message || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Add to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ variantId, quantity }, thunkAPI) => {
    try {
      return await cartService.addToCart(variantId, quantity)
    } catch (error) {
      const message = error.response?.data?.message || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Update cart item
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ variantId, quantity }, thunkAPI) => {
    try {
      return await cartService.updateCartItem(variantId, quantity)
    } catch (error) {
      const message = error.response?.data?.message || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Remove from cart
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (variantId, thunkAPI) => {
    try {
      return await cartService.removeFromCart(variantId)
    } catch (error) {
      const message = error.response?.data?.message || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Clear cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, thunkAPI) => {
    try {
      return await cartService.clearCart()
    } catch (error) {
      const message = error.response?.data?.message || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCartState: (state) => {
      state.isLoading = false
      state.isError = false
      state.message = ''
    },
  },
  extraReducers: (builder) => {
    builder
      // Get cart
      .addCase(getCart.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.cart = action.payload
        state.items = action.payload?.items || []
        state.totalItems = action.payload?.totalItems || 0
        state.subtotal = action.payload?.subtotal || 0
      })
      .addCase(getCart.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false
        state.cart = action.payload
        state.items = action.payload?.items || []
        state.totalItems = action.payload?.totalItems || 0
        state.subtotal = action.payload?.subtotal || 0
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      // Update cart item
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload
        state.items = action.payload?.items || []
        state.totalItems = action.payload?.totalItems || 0
        state.subtotal = action.payload?.subtotal || 0
      })
      // Remove from cart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cart = action.payload
        state.items = action.payload?.items || []
        state.totalItems = action.payload?.totalItems || 0
        state.subtotal = action.payload?.subtotal || 0
      })
      // Clear cart
      .addCase(clearCart.fulfilled, (state) => {
        state.cart = null
        state.items = []
        state.totalItems = 0
        state.subtotal = 0
      })
  },
})

export const { resetCartState } = cartSlice.actions
export default cartSlice.reducer

