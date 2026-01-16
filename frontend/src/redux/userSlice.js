import { createSlice } from "@reduxjs/toolkit"

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem("cartData");
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
  }
  return { cartItems: [], totalAmount: 0 };
};

const initialCart = loadCartFromStorage();

const userSlice = createSlice({
  name:"user",
  initialState:{
    userData:null,
    city:null,
    allShops:null,
    shop:null,
    shopsOfCity:null,
    itemsOfCity:null,
    cartItems: initialCart.cartItems,
    totalAmount: initialCart.totalAmount,
    myOrders:[],
    ownerPendingOrders:[],
    socket:null,
    deliveryBoys:[],
    searchItems:null,
    pendingOrdersCount: null
  },
  reducers:{
    setUserData:(state, action)=>{
      state.userData = action.payload
    },

    setCity:(state, action)=>{
      state.city = action.payload
    },

    setAllShops:(state, action)=>{
      state.allShops = action.payload
    },

    setShop:(state, action)=>{
      state.shop = action.payload
    },

    setShopsOfCity:(state, action)=>{
      state.shopsOfCity = action.payload
    },

    setPendingOrdersCount:(state, action)=>{
      state.pendingOrdersCount = action.payload
    },

    setItemsOfCity:(state, action)=>{
      state.itemsOfCity = action.payload
    },

    addToCart: (state, action) => {
      const item = action.payload;
      const existing = state.cartItems.find(i => i.id === item.id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        state.cartItems.push(item);
      }
      state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      // Save to localStorage
      localStorage.setItem("cartData", JSON.stringify({ cartItems: state.cartItems, totalAmount: state.totalAmount }));
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find(i => i.id === id);
      if (item) {
        item.quantity = quantity;
      }
      state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      // Save to localStorage
      localStorage.setItem("cartData", JSON.stringify({ cartItems: state.cartItems, totalAmount: state.totalAmount }));
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(i => i.id !== action.payload);
      state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      // Save to localStorage
      localStorage.setItem("cartData", JSON.stringify({ cartItems: state.cartItems, totalAmount: state.totalAmount }));
    },

    clearCart: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
      // Clear from localStorage
      localStorage.removeItem("cartData");
    },

    setMyOrders:(state,action)=>{
      state.myOrders = action.payload
    },

    setOwnerPendingOrders: (state, action) => {
      if (Array.isArray(action.payload)) {
        // initial fetch
        state.ownerPendingOrders = action.payload;
      } else {
        // socket se single order aaya -> sabse upar lagao
        state.ownerPendingOrders = [action.payload, ...state.ownerPendingOrders];
      }
    },


    setSocket:(state,action)=>{
      state.socket = action.payload
    },

    setDeliveryBoys: (state, action) => {
      state.deliveryBoys = action.payload;
    },

    setSearchItems: (state, action) => {
      state.searchItems = action.payload;
    },
  }

})

export const {setUserData, setCity, setAllShops, setShop, setShopsOfCity, setItemsOfCity, addToCart, 
  updateQuantity, removeFromCart, clearCart, setMyOrders, setOwnerPendingOrders, setSocket, setDeliveryBoys, setSearchItems, setPendingOrdersCount} = userSlice.actions

export default userSlice.reducer