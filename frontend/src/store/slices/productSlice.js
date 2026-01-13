import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import productService from '../../services/productService'

const initialState = {
  products: [],
  featuredProducts: [],
  newArrivals: [],
  saleProducts: [],
  currentProduct: null,
  relatedProducts: [],
  categories: [],
  totalPages: 0,
  totalElements: 0,
  currentPage: 0,
  isLoading: false,
  isError: false,
  message: '',
}

// Get products with filters
export const getProducts = createAsyncThunk(
  'product/getProducts',
  async (filters, thunkAPI) => {
    try {
      return await productService.getProducts(filters)
    } catch (error) {
      const message = error.response?.data?.message || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Get product by slug
export const getProductBySlug = createAsyncThunk(
  'product/getProductBySlug',
  async (slug, thunkAPI) => {
    try {
      return await productService.getProductBySlug(slug)
    } catch (error) {
      const message = error.response?.data?.message || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Get featured products
export const getFeaturedProducts = createAsyncThunk(
  'product/getFeaturedProducts',
  async (_, thunkAPI) => {
    try {
      return await productService.getFeaturedProducts()
    } catch (error) {
      const message = error.response?.data?.message || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Get new arrivals
export const getNewArrivals = createAsyncThunk(
  'product/getNewArrivals',
  async (_, thunkAPI) => {
    try {
      return await productService.getNewArrivals()
    } catch (error) {
      const message = error.response?.data?.message || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Get sale products
export const getSaleProducts = createAsyncThunk(
  'product/getSaleProducts',
  async (_, thunkAPI) => {
    try {
      return await productService.getSaleProducts()
    } catch (error) {
      const message = error.response?.data?.message || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Get related products
export const getRelatedProducts = createAsyncThunk(
  'product/getRelatedProducts',
  async (productId, thunkAPI) => {
    try {
      return await productService.getRelatedProducts(productId)
    } catch (error) {
      const message = error.response?.data?.message || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

// Get categories
export const getCategories = createAsyncThunk(
  'product/getCategories',
  async (_, thunkAPI) => {
    try {
      return await productService.getCategories()
    } catch (error) {
      const message = error.response?.data?.message || error.message
      return thunkAPI.rejectWithValue(message)
    }
  }
)

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    resetProductState: (state) => {
      state.isLoading = false
      state.isError = false
      state.message = ''
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null
      state.relatedProducts = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Get products
      .addCase(getProducts.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = action.payload.content
        state.totalPages = action.payload.totalPages
        state.totalElements = action.payload.totalElements
        state.currentPage = action.payload.number
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      // Get product by slug
      .addCase(getProductBySlug.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getProductBySlug.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentProduct = action.payload
      })
      .addCase(getProductBySlug.rejected, (state, action) => {
        state.isLoading = false
        state.isError = true
        state.message = action.payload
      })
      // Featured products
      .addCase(getFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload.content
      })
      // New arrivals
      .addCase(getNewArrivals.fulfilled, (state, action) => {
        state.newArrivals = action.payload.content
      })
      // Sale products
      .addCase(getSaleProducts.fulfilled, (state, action) => {
        state.saleProducts = action.payload.content
      })
      // Related products
      .addCase(getRelatedProducts.fulfilled, (state, action) => {
        state.relatedProducts = action.payload.content
      })
      // Categories
      .addCase(getCategories.fulfilled, (state, action) => {
        state.categories = action.payload
      })
  },
})

export const { resetProductState, clearCurrentProduct } = productSlice.actions
export default productSlice.reducer

