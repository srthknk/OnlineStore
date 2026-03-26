import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

let debounceTimer = null

export const uploadCart = createAsyncThunk('cart/uploadCart', 
    async ({ getToken }, thunkAPI) => {
        try {
            clearTimeout(debounceTimer)
            debounceTimer = setTimeout(async ()=> {
                const { cartItems } = thunkAPI.getState().cart;
                const token = await getToken();
                await axios.post('/api/cart', {cart: cartItems}, { headers: { Authorization: `Bearer ${token}` } })
            },1000)
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data)
        }
    }
)

export const fetchCart = createAsyncThunk('cart/fetchCart', 
    async ({ getToken }, thunkAPI) => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/cart', {headers: { Authorization: `Bearer ${token}` }})
            return data
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data)
        }
    }
)


const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        total: 0,
        cartItems: {},
    },
    reducers: {
        addToCart: (state, action) => {
            const { productId, selectedVariant } = action.payload
            const cartKey = selectedVariant ? `${productId}-${selectedVariant}` : productId
            
            if (state.cartItems[cartKey]) {
                state.cartItems[cartKey].quantity++
            } else {
                state.cartItems[cartKey] = {
                    quantity: 1,
                    selectedVariant: selectedVariant || null,
                    productId
                }
            }
            state.total += 1
        },
        removeFromCart: (state, action) => {
            const { productId, selectedVariant } = action.payload
            const cartKey = selectedVariant ? `${productId}-${selectedVariant}` : productId
            
            if (state.cartItems[cartKey]) {
                state.cartItems[cartKey].quantity--
                if (state.cartItems[cartKey].quantity === 0) {
                    delete state.cartItems[cartKey]
                }
            }
            state.total -= 1
        },
        deleteItemFromCart: (state, action) => {
            const { productId, selectedVariant } = action.payload
            const cartKey = selectedVariant ? `${productId}-${selectedVariant}` : productId
            
            state.total -= state.cartItems[cartKey] ? state.cartItems[cartKey].quantity : 0
            delete state.cartItems[cartKey]
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
        },
    },
    extraReducers: (builder)=>{
        builder.addCase(fetchCart.fulfilled, (state, action)=>{
            state.cartItems = action.payload.cart
            state.total = Object.values(action.payload.cart).reduce((acc, item) => {
                // Handle both old format (number) and new format (object with quantity)
                return acc + (typeof item === 'number' ? item : (item.quantity || 0))
            }, 0)
        })
    }
})

export const { addToCart, removeFromCart, clearCart, deleteItemFromCart } = cartSlice.actions

export default cartSlice.reducer
