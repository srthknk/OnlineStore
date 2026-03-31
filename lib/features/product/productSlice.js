import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

export const fetchProducts = createAsyncThunk('product/fetchProducts', 
    async ({ storeId }, thunkAPI) => {
        try {
            const { data } = await axios.get('/api/products' + (storeId ? `?storeId=${storeId}` : ''))
            console.log('[fetchProducts] Fetched', data.products?.length, 'products')
            if (data.products && data.products.length > 0) {
                console.log('[fetchProducts] First product images:', data.products[0].images)
            }
            return data.products
        } catch (error) {
            console.error('[fetchProducts] Error:', error.message)
            return thunkAPI.rejectWithValue(error.response?.data)
        }
    }
)

const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: [],
    },
    reducers: {
        setProduct: (state, action) => {
            state.list = action.payload
        },
        clearProduct: (state) => {
            state.list = []
        }
    },
    extraReducers: (builder)=>{
        builder.addCase(fetchProducts.fulfilled, (state, action)=>{
            state.list = action.payload
        })
    }
})

export const { setProduct, clearProduct } = productSlice.actions

export default productSlice.reducer